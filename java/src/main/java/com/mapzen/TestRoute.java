package com.mapzen;

import com.mapzen.osrm.Route;

import org.json.JSONObject;

public class TestRoute extends Route {
    private int currentLeg;

    public TestRoute(String jsonString) {
        super(jsonString);
    }

    public TestRoute(JSONObject jsonObject) {
        super(jsonObject);
    }

    public int getCurrentLeg() {
        return currentLeg;
    }

    public void setCurrentLeg(int currentLeg) {
        this.currentLeg = currentLeg;
    }
}
