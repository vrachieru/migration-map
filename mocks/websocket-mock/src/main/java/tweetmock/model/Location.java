package tweetmock.model;

public class Location {

    double latitude;

    double longitude;

    String country;

    String country_code;

    public Location() {
    }

    public Location(double latitude, double longitude, String country, String country_code) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.country = country;
        this.country_code = country_code;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountry_code() {
        return country_code;
    }

    public void setCountry_code(String country_code) {
        this.country_code = country_code;
    }
}
