var framework = window.framework = {
    formAjaxExecuting: false,


    init: function () {
        if (framework.verifyDependencies()) {
            framework.loadDateRegion();
            framework.loadDatepicker();
            framework.loadCheckToggle();
            framework.loadMaskMoney();
            framework.loadClear();
            framework.loadMask();
            framework.ajaxSetup();
            framework.loadEvents();
        }
    },
    loadEvents: function () {
        $(document).on('change', '[data-fmk-change]', framework.eventHandle);
        $(document).on('click', '[data-fmk-click]', framework.eventHandle);
        $(document).on('keydown', '[data-fmk-keydown]', framework.eventHandle);
        $(document).on('keypress', '[data-fmk-keypress]', framework.eventHandle);
        $(document).on('keyup', '[data-fmk-keyup]', framework.eventHandle);
        
        $('[data-fmk-change=change]').change();
        $('[data-fmk-click=click]').click();
        $('[data-fmk-keydown=keydown]').keydown();
    },



    eventHandle: function (e) {
        var data = $(this).data();
        var doNotAction = false;

        if (data.fmkKeypress != undefined && data.fmkKeypress != '' && e.keyCode != data.fmkKeypress) {
            doNotAction = true;
        }
        
        if (!doNotAction) {
            if (data.fmkCondition != undefined) {
                if (!eval(data.fmkCondition)) {
                    e.preventDefault();
                    eval(data.fmkConditionCallback);
                    return false;
                }
            }


            if (data.fmkAction == "parentFormSubmitAjax" || data.fmkPreventDefault != undefined)
                e.preventDefault();

            var canGo = true;

            if (data.fmkConfirm != undefined && data.fmkConfirm != '')
                canGo = confirm(data.fmkConfirm);

            if (canGo) {
                if (!data.fmkSchedule)
                    framework.actions[data.fmkAction]($(this));
                else {
                    clearTimeout($(this).attr('data-fmk-timeout-id'));
                    var obj = $(this);
                    var time = setTimeout(function () {
                        framework.actions[data.fmkAction](obj);
                        if (data.fmkCallback != undefined && data.fmkCallback != '') {
                            eval(data.fmkCallback);
                        }
                    }, data.fmkSchedule);
                    $(this).attr('data-fmk-timeout-id', time);
                }
            }




            if (!data.fmkSchedule && data.fmkCallback != undefined && data.fmkCallback != '') {
                eval(data.fmkCallback);
            }
        }
    },
    
    actions: {
        addEditor: function(obj) {
            var data = $(obj).data();
            var target = $(data.fmkTarget);
            var source = $(data.fmkSource);
            var template = $(data.fmkTemplate);
            var count = $(data.fmkEditorParent, target).length;

            var objData = {};
            objData["count"] = count;

            source.find('[data-fmk-name]').each(function() {
                objData[$(this).attr('data-fmk-name')] = $(this).val();
            });

            var toAppend = $(framework.addValueToTemplate(objData, template.html()));
            
            target.append(toAppend);
            
            framework.loadDatepicker(toAppend);
            framework.loadMaskMoney(toAppend);
            framework.loadClear(toAppend);
            framework.loadMask(toAppend);
        },
        
        click: function (obj) {
            var data = $(obj).data();
            var target = $(data.fmkTarget);
            target.click();
        },

        ajaxCall:function(obj) {

            var data = $(obj).data();
            var ajaxData = {};
            if (data.fmkSourceData != null && data.fmkSourceData != undefined) {
                var func = eval(data.fmkSourceData);
                if (typeof func == "function") {
                    ajaxData = func(obj);
                }
            } else {
                ajaxData = data;
            }

            $.ajax({
                url: data.fmkSource,
                type: 'POST',
                data: ajaxData,
                dataType: 'json',
                complete: function () {
                    
                },
                success: function (resp) {
                    if (data.fmkAlertCondition != undefined && data.fmkAlertCondition != '') {
                        if (eval(data.fmkAlertCondition))
                            framework.callMessage(resp.Messages.join('</br>'), resp.Status, data.fmkAjaxCallback, resp, obj);
                    } else
                        framework.callMessage(resp.Messages.join('</br>'), resp.Status, data.fmkAjaxCallback, resp, obj);
                }
            });
        },
        
        copyFormValues: function (obj) {
            var data = $(obj).data();
            var target = $(data.fmkTarget);
            var source = $(data.fmkSource);

            var sFields = source.find('[data-fmk-name]');
            sFields.each(function () {
                $('[data-fmk-name=' + $(this).attr('data-fmk-name') + ']', target).val($(this).val()).change();
            });
        },

        toggle: function (obj) {
            var data = $(obj).data();
            var target = $(data.fmkTarget);
            target.toggle();
        },

        append: function (obj) {
            var data = $(obj).data();
            var target = $(data.fmkTarget);
            var template = $(data.fmkTemplate).html();
            if (data.fmkSource != '' && data.fmkSource != undefined) {
                if (data.fmkSourceType == 'form') {
                    var obj = framework.getJson($(data.fmkSource));
                    target.append(framework.addValueToTemplate(obj, template));
                }
            }
            else
                target.append(template);
        },

        removeClosest: function (obj) {
            var data = $(obj).data();
            $(obj).closest(data.fmkTarget).remove();
        },

        parentFormSubmitAjax: function (obj) {
            if (!framework.formAjaxExecuting) {
                framework.formAjaxExecuting = true;
                var data = $(obj).data();
                var form = $(obj).closest('form');
                $.ajax({
                    url: form.attr('action'),
                    type: form.attr('method'),
                    data: form.serialize(),
                    complete: function () {
                        framework.formAjaxExecuting = false;
                    },
                    success: function (resp) {
                        if (data.fmkAlertCondition != undefined && data.fmkAlertCondition != '') {
                            if (eval(data.fmkAlertCondition))
                                framework.callMessage(resp.Messages.join('</br>'), resp.Status, data.fmkAjaxCallback, resp, obj);
                        } else
                            framework.callMessage(resp.Messages.join('</br>'), resp.Status, data.fmkAjaxCallback, resp, obj);
                    }
                });
            }
        },

        fill: function (obj) {
            var data = obj.data();
            var target = $(data.fmkTarget);
            var template = $(data.fmkTemplate).html();
            target.html('');
            if (data.fmkUrl != undefined || data.fmkSource != undefined) {
                $.ajax({
                    url: data.fmkUrl != undefined ? data.fmkUrl : data.fmkSource,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        id: obj.val()
                    },
                    success: function (resp) {
                        for (var r in resp) {
                            target.append(framework.addValueToTemplate(resp[r], template));
                        }
                        if (data.fmkAjaxCallback != undefined && data.fmkAjaxCallback != '') {
                            var func = eval(data.fmkAjaxCallback);
                            func(resp);
                        }
                    }
                });
            }

        }
    },
    
    loadMaskMoney: function (obj) {
        if (obj != undefined) {

            $('[data-fmk-currency]', obj).maskMoney({
                symbol: 'R$ ',
                thousands: '.',
                decimal: ','
            });
        } else {

            $('[data-fmk-currency]').maskMoney({
                symbol: 'R$ ',
                thousands: '.',
                decimal: ','
            });
        }
    },

    loadCheckToggle: function() {
        $('[data-fmk-check-toggle]').each(function() {
            var data = $(this).data();
            $(this).toggleButtons({
                width: 60,
                label: {
                    enabled: data.fmkCheckOn,
                    disabled: data.fmkCheckOff
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
            $('[data-fmk-datepicker]', obj).datepicker();
        } else {
            $('[data-fmk-datepicker]').datepicker();
        }
    },

    loadClear: function () {
        $('[data-fmk-clear]').each(function() {
            var clear = $(this).attr('data-fmk-clear');
            if ($(this).val() == clear || clear == '')
                $(this).val('');
        });
    },

    loadMask: function (obj) {
        if (obj != undefined) {
            $('[data-fmk-mask]', obj).each(function () {
                $(this).mask($(this).attr('data-fmk-mask'));
            });
        } else {
            $('[data-fmk-mask]').each(function () {
                $(this).mask($(this).attr('data-fmk-mask'));
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
                framework.blockUi();
            }).ajaxComplete(function (a) {
                framework.unblockUi();
            });

        }, 400);
    },

    unblockUi: function () {
        $('.block-ui-black').fadeOut(200, function () { $(this).remove(); });
    },

    blockUi: function () {
        var blockUi = $(framework.templates.blockUi).hide();
        $('body').append(blockUi);
        blockUi.show();
    },

    addAction: function(name, func) {
        framework.actions[name] = func;
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
            return template;
        } else {
            return "";
        }
    },

    getJson: function (obj) {
        var fmkName = '[data-fmk-name]';
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
