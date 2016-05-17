var Weather = React.createClass({displayName: 'Weather',
  getInitialState: function() {
    return {
      conditions:   [],
      location:     "",
      forecast:     [],
      showWX:     true
    };
  },

  // Get current geolocation from web browser
  getGeoLocation: function() {
    var that = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position.coords.latitude+","+position.coords.longitude);
        that.getWoeid(position.coords.latitude+","+position.coords.longitude);
      }, function(error) {
        console.error("We couldn't get your location.");
      });
    } else {
      console.error("Your browser doesn't have location services.");
    }
  },

  // Get WOEID (Where On Earth IDentifier) based on lat & lon. Hitting Yahoo!'s YQL for WOEID.
  getWoeid: function(latlon) {
    var that = this;
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22("+latlon+")%22&format=json&diagnostics=true&callback=?";
    $.getJSON(url,
      function(j) {
        that.getWeatherData(j.query.results.place.locality1.woeid);
      }).error(function(){
        console.error("We were unable to gather your WOEIED.");
      });
  },

  // Getting weather data from Yahoo!'s YQL.'
  getWeatherData: function(woeid) {
    var that = this;
    console.log("Getting WX data.");
    $.ajax({
      url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D"+woeid+"&format=json&diagnostics=true&callback=?",
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("Ajax success.");
        console.log(data.query.results.channel);
        that.setState({conditions: data.query.results.channel.item.condition, location: data.query.results.channel.location.city, forecast: data.query.results.channel.item.forecast});
      }.bind(that),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(that)
    });
  },

  componentDidMount: function() {
    this.getGeoLocation();
    setInterval(this.getGeoLocation, this.props.pollInterval);
  },

  onClick: function() {
    this.setState({ showWX: !this.state.showWX })
  },

  render: function() {
    console.log("Rendering weather div");
    console.log(this.state.conditions);
    return (
      <div className="weather" onClick={this.onClick}>
        { this.state.showWX ? <Conditions conditions={this.state.conditions} location={this.state.location} /> : null }
        { this.state.showWX ? <Forecast data={this.state.forecast} /> : null }
        { !this.state.showWX ? <Back /> : null }
      </div>
    );
  }
});

var Conditions = React.createClass({
  render: function() {
    console.log("Rendering temperature div.");
    console.log(this.props.conditions);
    return (
      <div className="conditions">
        It is currently {this.props.conditions.temp}&deg; and {this.props.conditions.text} in {this.props.location}.
      </div>
    )
  }
});

var Forecast = React.createClass({
  render: function() {
    var forecast = this.props.data.map(function(forecast) {
      return (
        <li key={forecast.date}>
          {forecast.day}<br />{forecast.high}
        </li>
      );
    });
    return (
      <ul className="forecast">
        {forecast}
      </ul>
    );
  }
});

var Back = React.createClass({
  render: function() {
    return (
      <div className="back">
        <p>This is the back.</p>
      </div>
    );
  }
});

ReactDOM.render(
  <Weather pollInterval={3600000} />,
  document.getElementById('warm-front')
);
