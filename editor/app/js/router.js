var router = {
    auth: function() {
        var user = localStorage.getItem("user");
        var current = router.current();

        if(current === "landing") {
            return true;
        }

        if(!user && current !== "landing") {
            return false;
        }

        return true;
    },
    go: function(state, params, root) {
        if(!state) {
            state = "landing";
        }

        if(router.current() != state) {
            var url = "/" + state + (params && params.length ? "/" + params.toString().replace(/\,/g, "/") : "");
            history.pushState({}, null, url);
        }

        //if(!router.auth.call(this)) {
        //    return;
        //}

        var parent = root || (this.state.parent ? this.state.parent : this.props.parent);

        return parent.clear();
    },
    getUrlParams: function() {
        return window.location.pathname.split("/").filter(function(state) { return !!state; });
    },
    userRequired: function(state) {
        var requiredStates = ["map", "location"];

        return requiredStates.indexOf(state) != -1;
    },
    current: function() {
        return router.getUrlParams()[0];
    }
};

module.exports = router;