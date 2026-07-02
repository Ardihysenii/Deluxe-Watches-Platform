package com.alfa.accessories.service;

import java.util.Locale;

final class WatchEmailTheme {

    private WatchEmailTheme() {
    }

    record Theme(String backgroundColor, String textColor, String accentColor) {
    }

    static Theme forColor(String color) {
        String normalized = color == null ? "" : color.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "gold" -> new Theme("#faf6ee", "#1a1a1a", "#a8842a");
            case "silver" -> new Theme("#eef1f5", "#1a1a1a", "#7a8494");
            case "black" -> new Theme("#141414", "#f5f5f5", "#888888");
            default -> new Theme("#f4f8f6", "#1a1a1a", "#4a6b5d");
        };
    }
}
