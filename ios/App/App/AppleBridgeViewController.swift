import Capacitor
import UIKit
import WebKit

final class AppleBridgeViewController: CAPBridgeViewController {
    private let previousPage = UIImageView()
    private var outgoingPage: UIView?
    private var snapshots: [Int: UIImage] = [:]
    private var snapshotRevision = 0
    private var historyIndex = 0
    private var historyKey: String?
    private var previewBlockers: [String: Set<String>] = [:]
    private var isDraggingBack = false
    private var isSettlingBack = false
    private var pendingBack: DispatchWorkItem?

    override func viewDidLoad() {
        super.viewDidLoad()
        bridge?.registerPluginInstance(AppleSignInPlugin())
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(BackSwipePlugin(controller: self))

        guard let webView else { return }

        let container = UIView(frame: webView.frame)
        container.backgroundColor = .systemBackground
        container.clipsToBounds = true
        previousPage.frame = container.bounds
        previousPage.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        previousPage.contentMode = .scaleToFill
        previousPage.isHidden = true
        container.addSubview(previousPage)
        webView.frame = container.bounds
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        container.addSubview(webView)
        view = container

        let backSwipe = UIScreenEdgePanGestureRecognizer(
            target: self,
            action: #selector(handleBackSwipe(_:))
        )
        backSwipe.edges = .left
        view.addGestureRecognizer(backSwipe)
        webView.scrollView.panGestureRecognizer.require(toFail: backSwipe)
    }

    @objc private func handleBackSwipe(_ gesture: UIScreenEdgePanGestureRecognizer) {
        guard let webView, !isSettlingBack, pendingBack == nil else { return }
        let distance = gesture.translation(in: view)
        let width = view.bounds.width
        guard width > 0 else { return }

        switch gesture.state {
        case .began:
            let previewBlocked = historyKey.map { previewBlockers[$0]?.isEmpty == false } ?? false
            guard historyIndex > 0 || previewBlocked else { return }
            isDraggingBack = true
            guard !previewBlocked else { return }
            previousPage.image = snapshots[historyIndex - 1]
            previousPage.backgroundColor = webView.scrollView.backgroundColor ?? .systemBackground
            previousPage.isHidden = false
        case .changed:
            guard isDraggingBack, !previousPage.isHidden else { return }
            let offset = min(max(distance.x, 0), width)
            webView.transform = CGAffineTransform(translationX: offset, y: 0)
            previousPage.transform = CGAffineTransform(translationX: (offset - width) * 0.2, y: 0)
        case .ended:
            guard isDraggingBack else { return }
            let velocity = gesture.velocity(in: view)
            let canCommit = distance.x > abs(distance.y) &&
                (distance.x >= width * 0.33 || (distance.x >= 32 && velocity.x > 500))
            if previousPage.isHidden {
                isDraggingBack = false
                if canCommit { bridge?.triggerWindowJSEvent(eventName: "nextstation:ios-back-swipe") }
                return
            }
            guard canCommit else {
                settleBack(navigated: false)
                return
            }
            freezeOutgoingPage(webView)
            let timeout = DispatchWorkItem { [weak self] in self?.settleBack(navigated: false) }
            pendingBack = timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45, execute: timeout)
            bridge?.triggerWindowJSEvent(eventName: "nextstation:ios-back-swipe")
        case .cancelled, .failed:
            if isDraggingBack, !previousPage.isHidden { settleBack(navigated: false) }
            isDraggingBack = false
        default:
            break
        }
    }

    private func freezeOutgoingPage(_ webView: WKWebView) {
        // Keep the outgoing pixels visible while the WebView renders the new route.
        guard let snapshot = webView.snapshotView(afterScreenUpdates: false) else { return }
        snapshot.frame = view.bounds
        snapshot.transform = webView.transform
        snapshot.isUserInteractionEnabled = false
        view.addSubview(snapshot)
        outgoingPage = snapshot
        view.sendSubviewToBack(webView)
        webView.transform = .identity
    }

    private func settleBack(navigated: Bool) {
        guard let webView else { return }
        pendingBack?.cancel()
        pendingBack = nil
        isDraggingBack = false
        isSettlingBack = true

        if navigated, outgoingPage == nil {
            view.bringSubviewToFront(previousPage)
            webView.transform = .identity
        }

        UIView.animate(withDuration: 0.18, delay: 0, options: .curveEaseOut) {
            if let outgoingPage = self.outgoingPage {
                outgoingPage.transform = navigated
                    ? CGAffineTransform(translationX: self.view.bounds.width, y: 0)
                    : .identity
            } else {
                webView.transform = .identity
            }
            self.previousPage.transform = .identity
        } completion: { _ in
            if navigated {
                UIView.animate(withDuration: 0.10, animations: {
                    self.previousPage.alpha = 0
                }, completion: { _ in self.finishSettlingBack() })
            } else {
                self.finishSettlingBack()
            }
        }
    }

    private func finishSettlingBack() {
        hideBackPreview()
        isSettlingBack = false
    }

    private func hideBackPreview() {
        webView?.transform = .identity
        outgoingPage?.removeFromSuperview()
        outgoingPage = nil
        view.sendSubviewToBack(previousPage)
        previousPage.transform = .identity
        previousPage.isHidden = true
        previousPage.alpha = 1
        previousPage.image = nil
    }

    fileprivate func setPreviewBlocked(key: String, id: String, blocked: Bool) {
        if blocked {
            previewBlockers[key, default: []].insert(id)
            if key == historyKey, isDraggingBack {
                hideBackPreview()
                if let pendingBack {
                    pendingBack.cancel()
                    self.pendingBack = nil
                    isDraggingBack = false
                }
            }
        } else {
            previewBlockers[key]?.remove(id)
            if previewBlockers[key]?.isEmpty == true { previewBlockers.removeValue(forKey: key) }
        }
    }

    fileprivate func routeChanged(index: Int, key: String) {
        guard index != historyIndex || key != historyKey else { return }
        if isDraggingBack, !previousPage.isHidden { settleBack(navigated: pendingBack != nil) }
        isDraggingBack = false

        historyIndex = index
        historyKey = key
        snapshots = snapshots.filter { $0.key < index && $0.key >= index - 4 }
        snapshotRevision += 1
        let revision = snapshotRevision

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            self?.captureSnapshot(revision: revision)
        }
    }

    fileprivate func captureBackPreview(key: String, completion: @escaping () -> Void) {
        guard key == historyKey else {
            completion()
            return
        }

        snapshots.removeValue(forKey: historyIndex)
        snapshotRevision += 1
        captureSnapshot(revision: snapshotRevision, completion: completion)
    }

    private func captureSnapshot(revision: Int, completion: @escaping () -> Void = {}) {
        guard let webView, snapshotRevision == revision, view.bounds.width > 0 else {
            completion()
            return
        }

        let index = historyIndex
        let configuration = WKSnapshotConfiguration()
        configuration.snapshotWidth = NSNumber(value: Double(view.bounds.width))
        webView.takeSnapshot(with: configuration) { [weak self] image, _ in
            defer { completion() }
            guard let self, self.snapshotRevision == revision else { return }
            self.snapshots[index] = image
        }
    }
}

@objc(BackSwipePlugin)
final class BackSwipePlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "BackSwipePlugin"
    let jsName = "BackSwipe"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "routeChanged", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "captureBackPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPreviewBlocked", returnType: CAPPluginReturnPromise)
    ]

    private weak var controller: AppleBridgeViewController?

    init(controller: AppleBridgeViewController) {
        self.controller = controller
        super.init()
    }

    @objc func routeChanged(_ call: CAPPluginCall) {
        guard let index = call.getInt("index"), let key = call.getString("key") else {
            call.reject("Route index and key are required")
            return
        }

        DispatchQueue.main.async { [weak self] in
            self?.controller?.routeChanged(index: index, key: key)
            call.resolve()
        }
    }

    @objc func setPreviewBlocked(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let id = call.getString("id"),
              let blocked = call.getBool("blocked") else {
            call.reject("Route key, blocker ID, and blocked state are required")
            return
        }

        DispatchQueue.main.async { [weak self] in
            self?.controller?.setPreviewBlocked(key: key, id: id, blocked: blocked)
            call.resolve()
        }
    }

    @objc func captureBackPreview(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Route key is required")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let controller = self?.controller else {
                call.resolve()
                return
            }
            controller.captureBackPreview(key: key) { call.resolve() }
        }
    }
}
