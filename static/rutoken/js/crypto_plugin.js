function CryptoPlugin() {
    this.pluginObject = document.getElementById("plugin-object");
    if (!this.pluginObject.valid) this.delayedReport("ОШИБКА: ошибка создания объекта работы с ключом");

}

CryptoPlugin.prototype = {

    delayedReport: function(message) {
        setTimeout(function() {
            alert(message)
        }, 0)
    },

    refreshDevices: function(devices_select) {
        $(devices_select).find('option').remove();
        $(devices_select).append('<option>Список обновляется...</option>');
        this.pluginObject.enumerateDevices(
            function (devices) {
                $(devices_select).find('option').remove();
                $(devices).each(function(){
                    $(devices_select).append('<option>'+ this +'</option>');
                })
            },
            function (errorCode) {
                alert(errorCode);
            }
        )
    }
};