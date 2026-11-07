package com.scinar.giderlerim.exception;

/** Kullanıcı, verilerinin yapay zeka sağlayıcısına aktarılmasına açık rıza vermediğinde fırlatılır. */
public class AiIzniGerekliException extends RuntimeException {
    public AiIzniGerekliException() {
        super("Yapay zeka özelliklerini kullanmak için verilerinizin yapay zeka sağlayıcısına aktarılmasına onay vermeniz gerekiyor.");
    }
}
