// frontend/src/components/LoginGraphic.jsx

function LoginGraphic() {
  return (
    <div>
      <img
        src="/login.png"
        alt="People using mobile devices"
        className="w-full h-auto object-contain"
      />
      <div className="mt-6 text-center">
        <h3 className="text-xl font-medium text-cyan-400">Connect anytime, anywhere</h3>
        <div className="mt-4 flex justify-center gap-4">
          <span className="auth-badge">Free</span>
          <span className="auth-badge">Easy Setup</span>
          <span className="auth-badge">Private</span>
        </div>
      </div>
    </div>
  );
}
export default LoginGraphic;
