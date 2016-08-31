module.exports = {
    getDelay: function() {
        var rand = Math.floor(Math.random() * 4000);

        return rand;
    },
    getRandomType: function() {
        var rand = Math.floor(Math.random() * 4);
        var type = "";

        switch(rand) {
            case 0:
                type = "stone";
                break;
            case 1:
                type = "ice";
                break;
            case 2:
                type = "lava";
                break;
            default:
                type = "grass";
                break;
        }

        return type;
    }
};