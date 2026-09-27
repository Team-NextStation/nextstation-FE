import Capacitor

final class AppleBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        bridge?.registerPluginInstance(AppleSignInPlugin())
    }
}
