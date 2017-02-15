package tweetmock.model;

public class Tweet {

    String username;

    String name;

    Long timestamp;

    String tweet;

    Location source;

    Location destination;

    public Tweet() {
    }

    public Tweet(String username, String name, Long timestamp, String tweet, Location source,
                 Location destination) {
        this.username = username;
        this.name = name;
        this.timestamp = timestamp;
        this.tweet = tweet;
        this.source = source;
        this.destination = destination;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public String getTweet() {
        return tweet;
    }

    public void setTweet(String tweet) {
        this.tweet = tweet;
    }

    public Location getSource() {
        return source;
    }

    public void setSource(Location source) {
        this.source = source;
    }

    public Location getDestination() {
        return destination;
    }

    public void setDestination(Location destination) {
        this.destination = destination;
    }
}
