$(document).ready(function () {
    if ($("div").is('.location__map')) {
        let mapWrapper = $('.location__map');
        let coordinate = [59.944851, 30.313575];
        coordinateData = mapWrapper.data('content').split(',');
        if (coordinateData[0] && coordinateData[1]) {
            coordinate = coordinateData;
        }
        var myMap;
        ymaps.ready(init);
        function init () {
            myMap = new ymaps.Map('location__map',
                {center: [coordinate[0],coordinate[1]], zoom: 17},
                { searchControlProvider: 'yandex#search'});
            myMap.geoObjects.add(new ymaps.Placemark([coordinate[0],coordinate[1]], {
            }, {
                preset: 'islands#icon',
                iconColor: '#0095b6'
            }))
        }
    }
});
/*
 |------------------------------------------------
 | Analytic
 |------------------------------------------------
 */
$(document).ready(function () {
    $('.analytic').each(function( index ) {
        let elemId = this.id
        this.addEventListener('click', function () {
            analytics.set(elemId)
        });
    });
    $('form').each(function( index ) {
        let formId = this.id
        if (formId) {
            $(this).find('input').each(function (index2) {
                this.addEventListener('click', {
                    handleEvent: function () {
                        analytics.set(this.formId, {interact: this.elem.id});
                    }, formId: formId, elem: this
                })
                this.addEventListener('focusout', {
                    handleEvent: function () {
                        analytics.set(this.formId, {interact: this.elem.id, input:this.elem.value});
                    }, formId: formId, elem: this
                })
            })
            $(this).find("button[type='submit']").on('click', { formId: formId }, function(event) {
                analytics.set(event.data.formId, {data: $('#'+event.data.formId).serializeArray()});
            })
        }
    });
});
