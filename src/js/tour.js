var tour = new Tour({
    backdrop: false,
    backdropContainer: 'body',
    steps: [
        /*
         * Howdy
         */

        {
            element: "i.globe",
            placement: "bottom",
            title: "Howdy!",
            content: "Well hi there. I'm going to show you around."
        },

        /*
         * Intro
         */

        {
            element: "i.globe",
            placement: "bottom",
            title: "Intro",
            content: "So, what are we trying to accomplish with this project?<br/>Take over the world of course!"
        },
        {
            element: "i.globe",
            placement: "bottom",
            title: "Intro",
            content: "First thing's first, let's get over the basics."
        },

        /*
         * Main menu
         */

        {
            element: "#live",
            placement: "bottom",
            title: "Live",
            content: "This righ here is where you can see people's intention of moving to another part of the world in real time."
        },
        {
            element: "#historical",
            placement: "bottom",
            title: "Historical",
            content: "This were you can see what happened within a period of time. All at your finger tips."
        },
        {
            element: "#statistics",
            placement: "bottom",
            title: "Statistics",
            content: "And last but not least, here you can see various statistics regarding what happened in a period of time.<br/>This is to give you a better idea of what's going on in the world and what the migration trends are."
        },
        {
            element: "#tour",
            placement: "bottom",
            title: "Tour",
            content: "I think you figured this one on your own. Good job!"
        },

        /*
         *
         */

        {
            element: ".leftpane",
            placement: "right",
            title: "The blue marble",
            content: "This is the blue marble, you migh have heard of it.<br/>You know, 'cause it's your home.</br>This is where you'll visually see the migration patterns."
        },
        {
            element: ".rightpane",
            placement: "left",
            title: "Tweets",
            content: "On the right we have the list of registered tweets from people that want to start a new life somewhere else.<br/>Maybe we'll get lucky and see a live one.<br/>Shh, don't scare them away!"
        },
        {
            element: "#details",
            placement: "top",
            title: "Details",
            content: "Next we have some details regarding the information displayed."
        },

        /*
         * Switch to historical
         */

        {
            element: ".rightpane",
            placement: "left",
            title: "Wake up!",
            content: "Hei, hei! Wake up!<br/>I'm not trying to bore you to death..<br/>Ok, ok. I get you.<br/>Let's see some action!",
            onNext: function (tour) {
                $('#historical').trigger("click");
            }
        },

        /*
         * Historical
         */

        {
            element: ".rightpane",
            placement: "left",
            title: "Incoming!",
            content: "This is more like it, eh?"
        },
        {
            element: "#top-countries-toggle",
            placement: "top",
            title: "Details",
            content: "You can click here to toggle between the top 5 source / destination countries.<br/> Try it out, it doesn't bite. Promise!"
        },
        {
            element: "#options",
            placement: "top",
            title: "Options",
            content: "Here we have some options for the map display.",
            onNext: function (tour) {
                $('#show-menu').trigger("click");
            }
        },
        {
            element: "#menu-date",
            placement: "top",
            title: "Current time",
            content: "This is the current time for the displayed data.<br/>It's in UTC so you don't get confused by those pesky timezones.",
        },
        {
            element: "#menu-slider",
            placement: "top",
            title: "Playback controls",
            content: "With these you can control the playback.",
        },
        {
            element: "#menu-representation",
            placement: "top",
            title: "Migration representation",
            content: "This is how migrations are represented visually. You can combine them however you like.",
        },
        {
            element: "#menu-projection",
            placement: "top",
            title: "Map type",
            content: "Select either a globe representation or a flat map.",
        },
        {
            element: "#menu-autorotation",
            placement: "top",
            title: "Autorotation",
            content: "It eh.. spins the globe. Yeah.",
        },
        {
            element: ".rightpane",
            placement: "left",
            title: "Tweets",
            content: "This is pretty much what you're used from Twitter.<br/>But as you've already noticed, source and destination countries are displayed as flags."
        },


        /*
         * Switch to statistics
         */

        {
            element: ".rightpane",
            placement: "left",
            title: "Hmm",
            content: "What else? What else?<br/>Oh, yeah! Statistics!"
        },


        /*
         * Statistics
         */

        {
            element: ".leftpane",
            placement: "right",
            title: "Statistics",
            content: "Here you can see what the migration patterns were in that period."
        },
        {
            element: ".rightpane",
            placement: "left",
            title: "Top Countries",
            content: "Also, here you can see the top countries."
        },


        /*
         * That's all folks!
         */

        {
            element: "i.globe",
            placement: "bottom",
            title: "That's all folks!",
            content: "Well, that's it.<br/>Thanks for bearing with me 'til the end!"
        }
    ]
});
