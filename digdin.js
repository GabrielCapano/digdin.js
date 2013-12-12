var digdin = window.digdin = {
    formAjaxExecuting: false,


    init: function () {
        if (digdin.verifyDependencies()) {
            digdin.loadDateRegion();
            digdin.loadDatepicker();
            digdin.loadCheckToggle();
            digdin.loadMaskMoney();
            digdin.loadClear();
            digdin.loadMask();
            digdin.ajaxSetup();
            digdin.loadEvents();
        }
    },
    loadEvents: function () {
        $(document).on('change', '[data-dgd-change]', digdin.eventHandle);
        $(document).on('click', '[data-dgd-click]', digdin.eventHandle);
        $(document).on('keydown', '[data-dgd-keydown]', digdin.eventHandle);
        $(document).on('keypress', '[data-dgd-keypress]', digdin.eventHandle);
        $(document).on('keyup', '[data-dgd-keyup]', digdin.eventHandle);
        
        $('[data-dgd-change=change]').change();
        $('[data-dgd-click=click]').click();
        $('[data-dgd-keydown=keydown]').keydown();
        $('[data-dgd-keypress=keypress]').keypress();
        $('[data-dgd-keyup=keyup]').keyup();
    },



    eventHandle: function (e) {
        var data = $(this).data();
        var doNotAction = false;

        if (data.dgdKeypress != undefined && data.dgdKeypress != '' && e.keyCode != data.dgdKeypress) {
            doNotAction = true;
        }
        
        if (!doNotAction) {
            if (data.dgdCondition != undefined) {
                if (!eval(data.dgdCondition)) {
                    e.preventDefault();
                    eval(data.dgdConditionCallback);
                    return false;
                }
            }


            if (data.dgdAction == "parentFormSubmitAjax" || data.dgdPreventDefault != undefined)
                e.preventDefault();

            var canGo = true;

            if (data.dgdConfirm != undefined && data.dgdConfirm != '')
                canGo = confirm(data.dgdConfirm);

            if (canGo) {
                if (!data.dgdSchedule)
                    digdin.actions[data.dgdAction]($(this));
                else {
                    clearTimeout($(this).attr('data-dgd-timeout-id'));
                    var obj = $(this);
                    var time = setTimeout(function () {
                        digdin.actions[data.dgdAction](obj);
                        if (data.dgdCallback != undefined && data.dgdCallback != '') {
                            eval(data.dgdCallback);
                        }
                    }, data.dgdSchedule);
                    $(this).attr('data-dgd-timeout-id', time);
                }
            }




            if (!data.dgdSchedule && data.dgdCallback != undefined && data.dgdCallback != '') {
                eval(data.dgdCallback);
            }
        }
    },
    
    actions: {
        addEditor: function(obj) {
            var data = $(obj).data();
            var target = $(data.dgdTarget);
            var source = $(data.dgdSource);
            var template = $(data.dgdTemplate);
            var count = $(data.dgdEditorParent, target).length;

            var objData = {};
            objData["count"] = count;

            source.find('[data-dgd-name]').each(function() {
                objData[$(this).attr('data-dgd-name')] = $(this).val();
            });

            var toAppend = $(digdin.addValueToTemplate(objData, template.html()));
            
            target.append(toAppend);
            
            digdin.loadDatepicker(toAppend);
            digdin.loadMaskMoney(toAppend);
            digdin.loadClear(toAppend);
            digdin.loadMask(toAppend);
        },
        
        click: function (obj) {
            var data = $(obj).data();
            var target = $(data.dgdTarget);
            target.click();
        },

        ajaxCall:function(obj) {

            var data = $(obj).data();
            var ajaxData = {};
            if (data.dgdSourceData != null && data.dgdSourceData != undefined) {
                var func = eval(data.dgdSourceData);
                if (typeof func == "function") {
                    ajaxData = func(obj);
                }
            } else {
                ajaxData = data;
            }

            $.ajax({
                url: data.dgdSource,
                type: 'POST',
                data: ajaxData,
                dataType: 'json',
                complete: function () {
                    
                },
                success: function (resp) {
                    if (data.dgdAlertCondition != undefined && data.dgdAlertCondition != '') {
                        if (eval(data.dgdAlertCondition))
                            digdin.callMessage(resp.Messages.join('</br>'), resp.Status, data.dgdAjaxCallback, resp, obj);
                    } else
                        digdin.callMessage(resp.Messages.join('</br>'), resp.Status, data.dgdAjaxCallback, resp, obj);
                }
            });
        },
        
        copyFormValues: function (obj) {
            var data = $(obj).data();
            var target = $(data.dgdTarget);
            var source = $(data.dgdSource);

            var sFields = source.find('[data-dgd-name]');
            sFields.each(function () {
                $('[data-dgd-name=' + $(this).attr('data-dgd-name') + ']', target).val($(this).val()).change();
            });
        },

        toggle: function (obj) {
            var data = $(obj).data();
            var target = $(data.dgdTarget);
            target.toggle();
        },

        append: function (obj) {
            var data = $(obj).data();
            var target = $(data.dgdTarget);
            var template = $(data.dgdTemplate).html();
            if (data.dgdSource != '' && data.dgdSource != undefined) {
                if (data.dgdSourceType == 'form') {
                    var obj = digdin.getJson($(data.dgdSource));
                    target.append(digdin.addValueToTemplate(obj, template));
                }
            }
            else
                target.append(digdin.proccessTemplate(template));
        },

        removeClosest: function (obj) {
            var data = $(obj).data();
            $(obj).closest(data.dgdTarget).remove();
        },

        parentFormSubmitAjax: function (obj) {
            if (!digdin.formAjaxExecuting) {
                digdin.formAjaxExecuting = true;
                var data = $(obj).data();
                var form = $(obj).closest('form');
                $.ajax({
                    url: form.attr('action'),
                    type: form.attr('method'),
                    data: form.serialize(),
                    complete: function () {
                        digdin.formAjaxExecuting = false;
                    },
                    success: function (resp) {
                        if (data.dgdAlertCondition != undefined && data.dgdAlertCondition != '') {
                            if (eval(data.dgdAlertCondition))
                                digdin.callMessage(resp.Messages.join('</br>'), resp.Status, data.dgdAjaxCallback, resp, obj);
                        } else
                            digdin.callMessage(resp.Messages.join('</br>'), resp.Status, data.dgdAjaxCallback, resp, obj);
                    }
                });
            }
        },

        fill: function (obj) {
            var data = obj.data();
            var target = $(data.dgdTarget);
            var template = $(data.dgdTemplate).html();
            target.html('');
            if (data.dgdUrl != undefined || data.dgdSource != undefined) {
                $.ajax({
                    url: data.dgdUrl != undefined ? data.dgdUrl : data.dgdSource,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        id: obj.val()
                    },
                    success: function (resp) {
                        for (var r in resp) {
                            target.append(digdin.addValueToTemplate(resp[r], template));
                        }
                        if (data.dgdAjaxCallback != undefined && data.dgdAjaxCallback != '') {
                            var func = eval(data.dgdAjaxCallback);
                            func(resp);
                        }
                    }
                });
            }

        }
    },
    
    loadMaskMoney: function (obj) {
        if (obj != undefined) {

            $('[data-dgd-currency]', obj).maskMoney({
                symbol: 'R$ ',
                thousands: '.',
                decimal: ','
            });
        } else {

            $('[data-dgd-currency]').maskMoney({
                symbol: 'R$ ',
                thousands: '.',
                decimal: ','
            });
        }
    },

    loadCheckToggle: function() {
        $('[data-dgd-check-toggle]').each(function() {
            var data = $(this).data();
            $(this).toggleButtons({
                width: 60,
                label: {
                    enabled: data.dgdCheckOn,
                    disabled: data.dgdCheckOff
                }
            });
        });
    },

    loadDateRegion: function () {
        $.datepicker.regional['pt-BR'] = {
            closeText: 'Fechar',
            prevText: '&#x3c;Anterior',
            nextText: 'Pr&oacute;ximo&#x3e;',
            currentText: 'Hoje',
            monthNames: ['Janeiro', 'Fevereiro', 'Mar&ccedil;o', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            dayNames: ['Domingo', 'Segunda-feira', 'Ter&ccedil;a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'],
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            weekHeader: 'Sm',
            dateFormat: 'dd/mm/yy',
            firstDay: 0,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
        };
        $.datepicker.setDefaults($.datepicker.regional['pt-BR']);
    },

    loadDatepicker: function (obj) {
        if (obj != undefined) {
            $('[data-dgd-datepicker]', obj).datepicker();
        } else {
            $('[data-dgd-datepicker]').datepicker();
        }
    },

    loadClear: function () {
        $('[data-dgd-clear]').each(function() {
            var clear = $(this).attr('data-dgd-clear');
            if ($(this).val() == clear || clear == '')
                $(this).val('');
        });
    },

    loadMask: function (obj) {
        if (obj != undefined) {
            $('[data-dgd-mask]', obj).each(function () {
                $(this).mask($(this).attr('data-dgd-mask'));
            });
        } else {
            $('[data-dgd-mask]').each(function () {
                $(this).mask($(this).attr('data-dgd-mask'));
            });
        }
    },

    callMessage: function (message, status, callback, data, obj) {
        $.blockUI({ message: '<div style="background:' + (status ? "#1d943b" : "#bb2413") + ';color:white;padding:15px;line-height:20px;"><h4>' + message + '</h4></div>', css: { border: 'none' } });
        setTimeout(function () {
            $.unblockUI();
            if (callback != undefined && callback != '') {
                var func = eval(callback);
                func(data, obj);
            }
        }, 1000);
    },


    ajaxSetup: function () {
        setTimeout(function () {
            $(document).ajaxStart(function (a) {
                digdin.blockUi();
            }).ajaxComplete(function (a) {
                digdin.unblockUi();
            });

        }, 400);
    },

    unblockUi: function () {
        $('.block-ui-black').fadeOut(200, function () { $(this).remove(); });
    },

    blockUi: function () {
        var blockUi = $(digdin.templates.blockUi).hide();
        $('body').append(blockUi);
        blockUi.show();
    },

    addAction: function(name, func) {
        digdin.actions[name] = func;
    },

    proccessTemplate: function(template){
        var keysJs = (template + '').match(/{{[\s\S]*}}/gi);




        for (var key = 0; key <= (keysJs.length -1) ;key++) {
            var str = keysJs[key];
            var ev = (str).replace('{{', '').replace('}}', '');
            var ret = eval(ev)
            template = template.replace(str, ret + '');
        }; 



        return template;
    },
    
    addValueToTemplate: function (data, template) {
        if (typeof template === 'string') {
            for (var key in data) {
                if (typeof data[key] === "object" && data[key] != null && data[key] != undefined) {
                    for (var innerKey in data[key]) {
                        var innerPattern = new RegExp('{' + key + '.' + innerKey + '}', 'gi');
                        template = template.replace(innerPattern, data[key][innerKey]);
                    }
                } else {
                    if (data.hasOwnProperty(key)) {
                        var pattern = new RegExp('{' + key + '}', 'gi');
                        template = template.replace(pattern, data[key]);
                    }

                }
            }

            return digdin.proccessTemplate(template);
        } else {
            return "";
        }
    },

    getJson: function (obj) {
        var fmkName = '[data-dgd-name]';
        var fields = obj.find(fmkName);
        var ret = {};
        fields.each(function () {
            ret[$(this).attr(fmkName.replace('[', '').replace(']', ''))] = $(this).val();
        });

        return ret;
    },

    verifyDependencies: function () {

        if (jQuery == undefined) {
            console.error('jQuery library is not loaded, please include it in file or check for file\'s order');
            return false;
        }

        if ($.datepicker == undefined) {
            console.error('jQuery UI datepicker library is not loaded, please include it in file or check for file\'s order');
            return false;
        }

        if ($.mask == undefined) {
            console.error('jQuery MaskedInput plugin is not loaded, please include it in file or check for file\'s order');
            return false;
        }

        return true;

    },

    templates: {
        blockUi:
            '<div class="block-ui-black" ' +
            'style="position:fixed; top:0; left:0; width: 100%; ' +
            'height:100%; background-color: #000; opacity:0.8;"></div>'
    }
};