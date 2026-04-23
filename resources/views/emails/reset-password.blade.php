<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de senha</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; }
        .btn { display: inline-block; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Redefinição de senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta (<strong>{{ $email }}</strong>).</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <p style="margin: 28px 0;">
            <a href="{{ config('app.frontend_url') }}/reset-password?token={{ $token }}" class="btn">
                Redefinir minha senha
            </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">
            Se o botão não funcionar, copie e cole este link no navegador:<br>
            <a href="{{ config('app.frontend_url') }}/reset-password?token={{ $token }}" style="color: #2563eb;">
                {{ config('app.frontend_url') }}/reset-password?token={{ $token }}
            </a>
        </p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.
        </div>
    </div>
</body>
</html>
