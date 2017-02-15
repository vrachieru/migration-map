package tweetmock.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import tweetmock.model.Tweet;

@Controller
public class TweetController {

    @MessageMapping("/tweetmock")
    @SendTo("/topic/tweets")
    public Tweet tweet(Tweet tweet) throws Exception {
        return tweet;
    }
}
