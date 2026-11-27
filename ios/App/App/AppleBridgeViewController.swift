import Capacitor
import UIKit
import WebKit

final class AppleBridgeViewController: CAPBridgeViewController {
    private let previousPage = UIImageView()
    private var snapshots: [Int: UIImage] = [:]
    private var historyIndex = 0
    private var historyKey: String?
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
            guard historyIndex > 0 else { return }
            isDraggingBack = true
            previousPage.image = snapshots[historyIndex - 1]
            previousPage.isHidden = false
        case .changed:
            guard isDraggingBack else { return }
            let offset = min(max(distance.x, 0), width)
            webView.transform = CGAffineTransform(translationX: offset, y: 0)
            previousPage.transform = CGAffineTransform(translationX: (offset - width) * 0.2, y: 0)
        case .ended:
            guard isDraggingBack else { return }
            let velocity = gesture.velocity(in: view)
            let canCommit = distance.x > abs(distance.y) &&
                (distance.x >= width * 0.33 || (distance.x >= 32 && velocity.x > 500))
            guard canCommit else {
                settleBack(navigated: false)
                return
            }
            let timeout = DispatchWorkItem { [weak self] in self?.settleBack(navigated: false) }
            pendingBack = timeout
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45, execute: timeout)
            bridge?.triggerWindowJSEvent(eventName: "nextstation:ios-back-swipe")
        case .cancelled, .failed:
            if isDraggingBack { settleBack(navigated: false) }
        default:
            break
        }
    }

    private func settleBack(navigated: Bool) {
        guard let webView else { return }
        pendingBack?.cancel()
        pendingBack = nil
        isDraggingBack = false
        isSettlingBack = true

        if navigated, previousPage.image != nil {
            // Cover the route update with the preview while the destination paints.
            view.bringSubviewToFront(previousPage)
            webView.transform = .identity
        }

        UIView.animate(withDuration: 0.22, delay: 0, options: .curveEaseOut) {
            webView.transform = .identity
            self.previousPage.transform = .identity
            if navigated { self.previousPage.alpha = 0 }
        } completion: { _ in
            self.view.sendSubviewToBack(self.previousPage)
            self.previousPage.isHidden = true
            self.previousPage.alpha = 1
            self.previousPage.image = nil
            self.isSettlingBack = false
        }
    }

    fileprivate func routeChanged(index: Int, key: String) {
        guard index != historyIndex || key != historyKey else { return }
        if isDraggingBack { settleBack(navigated: pendingBack != nil) }

        historyIndex = index
        historyKey = key
        snapshots = snapshots.filter { $0.key < index && $0.key >= index - 4 }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self, self.historyKey == key, self.historyIndex == index else { return }
            let configuration = WKSnapshotConfiguration()
            configuration.snapshotWidth = NSNumber(value: Double(self.view.bounds.width))
            self.webView?.takeSnapshot(with: configuration) { [weak self] image, _ in
                guard let self, self.historyKey == key, self.historyIndex == index else { return }
                self.snapshots[index] = image
            }
        }
    }
}

@objc(BackSwipePlugin)
final class BackSwipePlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "BackSwipePlugin"
    let jsName = "BackSwipe"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "routeChanged", returnType: CAPPluginReturnPromise)
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
}
