package com.mapzen;

import org.json.JSONArray;
import org.json.JSONObject;
import org.zeromq.ZMQ;

import android.location.Location;

import static android.location.LocationManager.FUSED_PROVIDER;

public class Runner {
    public static final String ROUTE = "route";
    public static final String RAW = "raw";
    public static final String COORDINATES = "coordinates";
    public static final String CURRENT_LEG = "current_leg";
    public static final String LOST = "lost";
    public static final String BIND_ADDRESS = "tcp://*:5555";

    public static void main(String[] args) throws Exception {
        ZMQ.Context context = ZMQ.context(1);
        ZMQ.Socket responder = context.socket(ZMQ.REP);
        responder.bind(BIND_ADDRESS);

        while (!Thread.currentThread().isInterrupted()) {
            byte[] request = responder.recv(0);
            JSONObject jsonObject = new JSONObject(new String(request));
            JSONObject theRoute = jsonObject.getJSONObject(ROUTE);
            TestRoute route = new TestRoute(theRoute.getString(RAW));
            Location location = getNewLocation(jsonObject);
            route.setCurrentLeg(jsonObject.getInt(CURRENT_LEG));
            Location correctedLocation = route.snapToRoute(location);
            if (correctedLocation != null) {
                String response = String.valueOf(correctedLocation.getLatitude())
                        + ", "
                        + String.valueOf(correctedLocation.getLongitude())
                        + ", "
                        + String.valueOf(route.getCurrentLeg());
                responder.send(response.getBytes(), 0);
            } else {
                responder.send(LOST.getBytes(), 0);
            }
        }
        responder.close();
        context.term();
    }

    private static Location getNewLocation(JSONObject jsonObject) {
        JSONArray jsonArray = jsonObject.getJSONArray(COORDINATES);
        double lat = Double.valueOf(jsonArray.getString(0));
        double lng = Double.valueOf(jsonArray.getString(1));
        Location location = new Location(FUSED_PROVIDER);
        location.setLatitude(lat);
        location.setLongitude(lng);
        return location;
    }
}
