import AuthenticationServices
import Capacitor
import CryptoKit

@objc(AppleSignInPlugin)
public final class AppleSignInPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppleSignInPlugin"
    public let jsName = "AppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise)
    ]

    private var authorizationController: ASAuthorizationController?

    @objc func signIn(_ call: CAPPluginCall) {
        guard let rawNonce = call.getString("nonce"), !rawNonce.isEmpty else {
            call.reject("Apple 로그인 nonce가 필요합니다.", "INVALID_NONCE")
            return
        }

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = Self.sha256(rawNonce)

        authorizationController = ASAuthorizationController(authorizationRequests: [request])
        authorizationController?.delegate = self
        authorizationController?.presentationContextProvider = self

        currentCallId = call.callbackId
        bridge?.saveCall(call)
        authorizationController?.performRequests()
    }

    private static func sha256(_ value: String) -> String {
        let digest = SHA256.hash(data: Data(value.utf8))
        return digest.map { String(format: "%02x", $0) }.joined()
    }

    private func resolveSavedCall(_ result: PluginCallResultData) {
        guard let callId = currentCallId,
              let call = bridge?.savedCall(withID: callId) else {
            return
        }

        call.resolve(result)
        bridge?.releaseCall(call)
        currentCallId = nil
        authorizationController = nil
    }

    private func rejectSavedCall(_ message: String, code: String) {
        guard let callId = currentCallId,
              let call = bridge?.savedCall(withID: callId) else {
            return
        }

        call.reject(message, code)
        bridge?.releaseCall(call)
        currentCallId = nil
        authorizationController = nil
    }

    private var currentCallId: String?

}

extension AppleSignInPlugin: ASAuthorizationControllerDelegate {
    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = credential.identityToken,
              let identityTokenString = String(data: identityToken, encoding: .utf8)
        else {
            rejectSavedCall("Apple identity token을 받지 못했습니다.", code: "MISSING_IDENTITY_TOKEN")
            return
        }

        resolveSavedCall([
            "identityToken": identityTokenString,
            "user": credential.user,
        ])
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        let authorizationError = error as? ASAuthorizationError
        let code = authorizationError?.code == .canceled ? "USER_CANCELLED" : "APPLE_SIGN_IN_FAILED"
        let message = authorizationError?.code == .canceled
            ? "Apple 로그인이 취소되었습니다."
            : "Apple 로그인에 실패했습니다."
        rejectSavedCall(message, code: code)
    }
}

extension AppleSignInPlugin: ASAuthorizationControllerPresentationContextProviding {
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        bridge?.viewController?.view.window ?? UIWindow()
    }
}
