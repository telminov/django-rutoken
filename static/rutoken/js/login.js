$(function(){
    crypto_ui = new CryptoUI({
        content_box: '.box-container-toggle'
    });
    crypto_ui.refreshDevices('#id_devices');
});