function MapCell(props, parent) {
    return React.createClass({
        getInitialState: function() {
          return {
              data: props,
              parent: parent
          }
        },
        render: function() {
            var self = this;
            return (
                <div className={'map-cell text-center pull-left ' + this.state.data.type}
                     onClick={self.state.parent.router.go.bind(self, "location", [this.state.data.name], null)}></div>
            );
        }
    })
}

module.exports = MapCell;