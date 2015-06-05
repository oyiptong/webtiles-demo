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
      this.props.tile.enhancedImageURIState.display = 'block';
      this.props.tile.imageURIState.display = 'none';
      this.forceUpdate();
    }
  },

  onMouseOut: function() {
    if (this.props.tile.enhancedImageURI) {
      this.props.tile.enhancedImageURIState.display = 'none';
      this.props.tile.imageURIState.display = 'block';
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

var TileGrid = React.createClass({
  getInitialState: function() {
    return {
      tiles: []
    };
  },

  componentDidMount: function() {
    addon.on("tilesData", function(items) {
      if (this.isMounted()) {
        for (var i=0; i < items.length; i++) {
          var item = items[i];
          item.enhancedImageURIState = {display: 'none'};
          item.imageURIState = {display: 'block'};
          item.buttons = {display: 'none'};
        }
        this.setState({tiles: items});
      }
    }.bind(this));
    addon.emit("gridReady");
  },

  render: function() {
    var tiles = this.state.tiles;
    return (
      <div id="newtab-grid">
        {tiles.map(function(tile) {
          return <Tile tile={tile} key={tile.directoryId}/>;
        })}
      </div>
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
