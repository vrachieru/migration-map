var stompClient = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
}

function connect() {
    var socket = new SockJS('/websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
    });
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    stompClient.send("/app/tweetmock", {}, JSON.stringify(
        {
            "username": $("#username").val(),
            "name": $("#name").val(),
            "timestamp": $("#timestamp").val(),
            "tweet": $("#tweet").val(),
            "source": {
                "latitude": $("#s_latitude").val(),
                "longitude": $("#s_longitude").val(),
                "country": $("#s_country").val(),
                "country_code": $("#s_country_code").val()
            },
            "destination": {
                "latitude": $("#d_latitude").val(),
                "longitude": $("#d_longitude").val(),
                "country": $("#d_country").val(),
                "country_code": $("#d_country_code").val()
            }
        }
    ));
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#send" ).click(function() { sendName(); });
});

