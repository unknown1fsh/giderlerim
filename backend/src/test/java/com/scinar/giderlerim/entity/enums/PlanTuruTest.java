package com.scinar.giderlerim.entity.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlanTuruTest {

    @Test
    void freeYalnizcaFreeOzelliklerineErisebilir() {
        assertTrue(PlanTuru.FREE.enAz(PlanTuru.FREE));
        assertFalse(PlanTuru.FREE.enAz(PlanTuru.PREMIUM));
        assertFalse(PlanTuru.FREE.enAz(PlanTuru.ULTRA));
    }

    @Test
    void premiumFreeVePremiumOzelliklerineErisebilir() {
        assertTrue(PlanTuru.PREMIUM.enAz(PlanTuru.FREE));
        assertTrue(PlanTuru.PREMIUM.enAz(PlanTuru.PREMIUM));
        assertFalse(PlanTuru.PREMIUM.enAz(PlanTuru.ULTRA));
    }

    @Test
    void ultraTumPlanOzelliklerineErisebilir() {
        assertTrue(PlanTuru.ULTRA.enAz(PlanTuru.FREE));
        assertTrue(PlanTuru.ULTRA.enAz(PlanTuru.PREMIUM));
        assertTrue(PlanTuru.ULTRA.enAz(PlanTuru.ULTRA));
    }
}
