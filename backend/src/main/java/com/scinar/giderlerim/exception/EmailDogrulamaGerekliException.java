package com.scinar.giderlerim.exception;

/** Doğrulama zorunlu olan bir hesap, e-postasını doğrulamadan kısıtlı bir özelliği kullanmaya çalıştığında fırlatılır. */
public class EmailDogrulamaGerekliException extends RuntimeException {
    public EmailDogrulamaGerekliException() {
        super("Bu özelliği kullanmak için önce e-posta adresinizi doğrulayın. Doğrulama bağlantısını e-postanızda bulabilir veya yeniden gönderebilirsiniz.");
    }
}
