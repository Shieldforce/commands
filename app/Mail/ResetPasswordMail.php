<?php

namespace App\Mail;

use App\Models\PasswordReset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class ResetPasswordMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $token;

    public function __construct(public string $email)
    {
        PasswordReset::updateOrCreate(
            ['email' => $email],
            ['token' => $this->token = Str::random(64)]
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Redefinição de senha');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reset-password');
    }
}
