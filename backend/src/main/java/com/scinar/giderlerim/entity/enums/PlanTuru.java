package com.scinar.giderlerim.entity.enums;

public enum PlanTuru {
    FREE(0),
    PREMIUM(1),
    ULTRA(2);

    private final int seviye;

    PlanTuru(int seviye) {
        this.seviye = seviye;
    }

    public boolean enAz(PlanTuru gerekliPlan) {
        return this.seviye >= gerekliPlan.seviye;
    }
}
