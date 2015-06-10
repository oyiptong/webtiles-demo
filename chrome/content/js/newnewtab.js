var Tile = React.createClass({
  getDefaultProps: function() {
    return {
      url: '',
      title: '',
      directoryId: null,
      frecency: null,
      imageURI: '',
      enhancedImageURI: null,
      lastVisitDate: null,
      bgColor: null,
      type: '',
      enhancedImageURIState: {display: 'none'},
      imageURIState: {display: 'block'},
      buttons: {display: 'none'}
    }
  },

  onMouseOver: function() {
    if (this.props.tile.enhancedImageURI) {
      this.props.tile.enhancedImageURIState.display = 'none';
      this.props.tile.imageURIState.display = 'block';
      this.forceUpdate();
    }
  },

  onMouseOut: function() {
    if (this.props.tile.enhancedImageURI) {
      this.props.tile.enhancedImageURIState.display = 'block';
      this.props.tile.imageURIState.display = 'none';
      this.forceUpdate();
    }
  },

  render: function() {
    var imageURIStyle = {
      backgroundImage: 'url(' + this.props.tile.imageURI + ')',
      display: this.props.tile.imageURIState.display,
      backgroundColor: this.props.tile.bgColor
    };

    var enhancedImageURIStyle = {
      backgroundImage: this.props.tile.enhancedImageURI ? 'url(' + this.props.tile.enhancedImageURI + ')' : null,
      display: this.props.tile.enhancedImageURIState.display,
      backgroundColor: this.props.tile.bgColor
    };

    if (enhancedImageURIStyle.backgroundImage == null) {
      enhancedImageURIStyle.display = 'none';
      imageURIStyle.display = 'block';
    }

    return (
        <div className="newtab-cell" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
          <div className="newtab-site">
            <a className="newtab-link" title={this.props.tile.title} href={this.props.tile.url}>
              <span className="newtab-thumbnail" style={imageURIStyle}></span>
              <span className="newtab-thumbnail enhanced-content" style={enhancedImageURIStyle}></span>
              <span className="newtab-title">{this.props.tile.title}</span>
            </a>
          </div>
        </div>
    );
  }
});

var TileRSS = React.createClass({
  getDefaultProps: function() {
    return {
      url: '',
      title: '',
      directoryId: null,
      frecency: null,
      imageURI: '',
      enhancedImageURI: null,
      lastVisitDate: null,
      bgColor: null,
      type: '',
      entries: []
    }
  },

  render: function() {
    var rows = this.props.tile.entries.map(function(entry) {
      return <li><a href={entry.link}>{entry.title}</a></li>
    }.bind(this));

    return (
        <div className="newtab-cell">
          <div className="newtab-site">
            <div className="newtab-link" title={this.props.tile.title}>
              <div className="newtab-rss">
                <ul>
                  {rows}
                </ul>
              </div>
              <span className="newtab-title">{this.props.tile.title}</span>
            </div>
          </div>
        </div>
    );
  }
});

var TileGrid = React.createClass({
  getInitialState: function() {
    return {
      tiles: [],
      feedEntries: {}
    };
  },

  componentDidMount: function() {
    addon.on("tilesData", function(items) {
      if (this.isMounted()) {
        for (var i=0; i < items.length; i++) {
          var item = items[i];
          item.enhancedImageURIState = {display: 'block'};
          item.imageURIState = {display: 'block'};
        }
        this.setState({tiles: items});
      }
    }.bind(this));

    addon.on("feedData", function(data) {
      if (this.isMounted()) {
        this.setState(function(prevState, props) {
          prevState.feedEntries[data.url] = data;
          return prevState;
        });
        this.forceUpdate();
      }
    }.bind(this));

    addon.emit("gridReady");
  },

  render: function() {
    var tiles = this.state.tiles.map(function(tile) {
      if (this.state.feedEntries.hasOwnProperty(tile.url)) {
        return <TileRSS tile={this.state.feedEntries[tile.url]} key={tile.directoryId}/>;
      }
      return <Tile tile={tile} key={tile.directoryId}/>;
    }.bind(this));

    return (
      <div id="newtab-grid">{tiles}</div>
    );
  }
});

var NewNewTabPage = React.createClass({
  render: function() {
    return (
      <div id="newtab-scrollbox">
        <div id="newtab-vertical-margin">
          <div id="newtab-margin-top"/>
        </div>

        <div id="newtab-search-container">
          <div id="newtab-search-form" name="searchForm">
            <div id="newtab-search-logo"/>
            <input type="text" name="q" value="" id="newtab-search-text" maxlength="256" dir="auto"/>
            <input id="newtab-search-submit" type="submit" value="Search"/>
          </div>
        </div>

        <div id="">
          <div className="newtab-side-margin"/>
          <TileGrid/>
          <div className="newtab-side-margin"/>
        </div>

        <div id="newtab-margin-bottom"/>
      </div>
    );
  }
});

React.render(
    <NewNewTabPage/>,
    document.querySelector('#content')
);
