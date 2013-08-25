var addRow, setFirstRow;

addRow = function (o, v) {
    var input, hName, hID, espan, nRow, rootRow;

    rootRow = (!v) ? $("#headers_setup") : $("#values_setup");
    if (!v) {
        nRow = $("#headers_setup div.header_setup_row:nth-of-type(1)").clone()
    } else {
        nRow = $("#values_setup div.header_setup_row:nth-of-type(1)").clone()
    }
    hID = (o && o.hasOwnProperty('id')) ? o.id : makeId();
    /**
     * If object not passed here then this is
     * a row for adding the new header
     * add the "temp" class to it
     * to indicate that this item
     * is not yet saved
     *
     */
    if (!o) {
        nRow.addClass('temp');
    }
    /**
     * If object o not passed
     * or does not have hname
     * then set the name of new header
     * to a default extra header name
     */
    hName = (!o || !o.hasOwnProperty('hname')) ? DEFAULT_HEADER_NAME : o.hname;
    input = nRow.find('input');
    $(input).attr('id', hID).val((v ? o.value : hName));

    espan = nRow.find('span');
    $(espan).html(hName);

    if (!v) {
        nRow.append('<button class="btn btn-danger delete_header" type="button"><i class="icon-minus-sign icon-white"></i> Delete</button>');
    }
    nRow.appendTo(rootRow);
}

setFirstRow = function (o, v) {
    console.log("setting first row: " + o.id + ' val: ' + o.value + " v is: " + v);
    if (!v) {
        $("#headers_setup div.header_setup_row:nth-of-type(1) > div > span").html(o.hname);
        $("#headers_setup div.header_setup_row:nth-of-type(1) > div > input").val((v ? o.value : o.hname)).attr('id', o.id);
    } else {
        $("#values_setup div.header_setup_row:nth-of-type(1) > div > span").html(o.hname);
        $("#values_setup div.header_setup_row:nth-of-type(1) > div > input").val((v ? o.value : o.hname)).attr('id', o.id);
    }
}


$(function () {
    var oData, n, y, isPopup, bgp = chrome.extension.getBackgroundPage();
    y = (new Date().getFullYear());
    n = $("#f1").html();
    $("#f1").html(n + " " + y);

    oData = bgp.oData;
    isPopup = $('body').hasClass('popup');
    window.alert = function(s){
        s = s.replace("\n", "<br>");
        $("#modal_alert").html(s);
        $('#myModal').modal({backdrop:false, show:true});
    }

    $("#headers_setup").on('click', '.save_name', function (e) {
        var i, tempDiv, div, myitem, input, span, val, myid, edited = false;
        div = $(this).closest('div');
        tempDiv = $(this).closest('div.temp');
        input = div.find('input');
        val = input.val();
        val = $.trim(val);
        myid = $(input).attr('id');
        span = div.find('span');
        span = $(span);
        console.log('saving id: ' + myid + ' val: ' + val);
        if (val.length === 0) {
            alert("Please Enter the name of this Extra Header");
            return;
        }

        val = val.replace(/\s+/g, '-');
        for (i = 0; i < oData[HEADERS_KEY].length; i += 1) {
            if (oData[HEADERS_KEY][i].id === myid) {
                myitem = oData[HEADERS_KEY][i];
                oData[HEADERS_KEY][i].hname = val;
                edited = true;
            } else {
                if (oData[HEADERS_KEY][i].hname.toLocaleLowerCase() === val.toLocaleLowerCase()) {
                    alert("Extra header with this name already defined\nPlease choose a different name");
                    return;
                }
            }

        }

        if (!edited) {
            oData[HEADERS_KEY].push({id:myid, hname:val, value:""});
            console.log("added item to array of extra headers");
        }
        persist(oData, function () {
            console.log('item saved to storage');
            span.html(val);
            input.val(val);
            tempDiv.removeClass('temp');
        })
    })

    $("#save_hosts").click(function (e) {
        var aHosts = [], hosts = $("#edit_domains").val();
        hosts = $.trim(hosts);
        console.log('hosts to save: ' + hosts);
        if (hosts.length > 0) {
            hosts = hosts.toLowerCase();
            aHosts = hosts.split("\n");
        }
        console.log('aHosts: ' + aHosts.join("\n"));
        oData[DOMAINS_KEY] = aHosts;
        persist(oData, function () {
            console.log("hosts saved");
        });
    })

    $("#request_t input[type='checkbox']").change(function(e){
        var aVals = [], my = $("input[type='checkbox']:checked");
        console.log("checks: " + my.length);
        my.each(function(i){
            aVals.push($(this).val());
        })
        console.log('aVals: ' + aVals);
        oData[REQUEST_TYPES_KEY] = aVals;
        persist(oData, function () {
            bgp.initpgpage(true);
        });

    })

    setTypes = function(){
        var checkBoxes = $("#request_t input[type='checkbox']");
        checkBoxes.each(function(i){
            if($.inArray($(this).val(), oData[REQUEST_TYPES_KEY]) > -1 ){
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        })
    }

    /**
     * Populate domain names textarea
     * with values stored in DOMAINS_KEY (array)
     */
    if (oData[DOMAINS_KEY]) {
        $("#edit_domains").val(oData[DOMAINS_KEY].join("\n"));
    }


    $("#headers_setup").on('click', '.delete_header', function (e) {
        var div, input, myid;
        div = $(this).closest('div');
        input = div.find('input');
        myid = $(input).attr('id');

        for (i = 0; i < oData[HEADERS_KEY].length; i += 1) {
            if (oData[HEADERS_KEY][i].id === myid) {
                console.log('removing element ' + i + ' from array of headers');
                oData[HEADERS_KEY].splice(i, 1);
                break;
            }
        }

        persist(oData, function () {
            div.remove();
        });
    })

    $("#add_header").click(function (e) {

        if ($("div.temp").length > 0) {
            alert("Another new header have not been saved yet\nPlease save pending new header before adding another one");
            return;
        }
        addRow();
    })

    $("#values_setup").on('click', '.save_val', function (e) {
        var i, div, input, val, myid, edited = false;
        div = $(this).closest('div');
        input = div.find('input');
        val = input.val();
        val = $.trim(val);
        myid = $(input).attr('id');

        console.log('saving id: ' + myid + ' val: ' + val);
        for (i = 0; i < oData[HEADERS_KEY].length; i += 1) {
            if (oData[HEADERS_KEY][i].id === myid) {
                myitem = oData[HEADERS_KEY][i];
                oData[HEADERS_KEY][i].value = val;
                console.log('before persist: ' + myid + ' val: ' + val);
                bgp.persist(oData, function () {
                    console.log('saved to storage');
                });
                break;
            }
        }

    });

    setFirstRow(oData[HEADERS_KEY][0], isPopup);
    setTypes();
    /**
     * If more that one extra header
     * (one is always present)
     * then add other rows
     */
    if (oData[HEADERS_KEY].length > 1) {
        for (var jj = 1; jj < oData[HEADERS_KEY].length; jj += 1) {
            addRow(oData[HEADERS_KEY][jj], isPopup);
        }
    }
})
