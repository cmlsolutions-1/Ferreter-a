export const generateVerificationCodeEmail = (code: string): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Código de Restablecimiento</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          background-color: white;
          margin: 20px auto;
          padding: 30px;
          max-width: 600px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          color: #2c3e50;
        }
        .content {
          color: #555;
          line-height: 1.6;
        }
        .code {
          background-color: #f4c048;
          padding: 15px;
          font-size: 1.4rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 2px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          font-size: 0.9rem;
          color: #aaa;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Restablece tu contraseña</h2>
        </div>
        <div class="content">
          <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
          
          <div class="code">${code}</div>
          
          <p>Utilízalo para restablecer tu contraseña en nuestra plataforma.</p>
          <p>Si no solicitaste este cambio, simplemente ignora este correo.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Distribuciones Ferrelectricos Restrepo</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
