$(document).ready(function () {
    var url = "ajax/ajaxCard";
    var ajaxobj = new AjaxObject(url, 'json');
    ajaxobj.getall();

    // bootstrap popover
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
    })

    // 新增按鈕
    $("#addbutton").click(function (e) {
        // 開啟驗證
        this.form.reportValidity();
        var url = "ajax/ajaxCard";
        var cnname = $("#addcnname").val();
        var enname = $("#addenname").val();
        var sex = $('input:radio:checked[name="addsex"]').val();
        var phone = $("#addphone").val();
        var mail = $("#addmail").val();

        checkPhone(phone, "#addphone");
        
        if(cnname && sex && phone && mail) {
            var ajaxobj = new AjaxObject(url, 'json');
            ajaxobj.cnname = cnname;
            ajaxobj.enname = enname;
            ajaxobj.sex = sex;
            ajaxobj.phone = phone;
            ajaxobj.mail = sex;
            ajaxobj.add();
            // 關閉modal
            $("#addFormModal").modal('hide');
        }
        e.preventDefault(); // avoid to execute the actual submit of the form.
    })
    // 重新填寫新增按鈕
    $("#reNewbutton").click(function () {
        $("#addform")[0].reset();
    })
    
    // 搜尋按鈕
    $("#searchbutton").click(function (e) {
        var url = "ajax/ajaxCard";
        // var data = $("#searchform").serialize();
        var cnname = $("#secnname").val();
        var enname = $("#seenname").val();
        var sex = $('input:radio:checked[name="sesex"]').val();
        var ajaxobj = new AjaxObject(url, 'json');
        ajaxobj.cnname = cnname;
        ajaxobj.enname = enname;
        ajaxobj.sex = sex;
        ajaxobj.search();

        e.preventDefault(); // avoid to execute the actual submit of the form.
    })

    // 重新填寫搜尋按鈕
    $("#reSerchbutton").click(function () {
        $("#searchform")[0].reset();
    })

    // 修改鈕
    $("#cardtable").on('click', '.modifybutton', function () {
        var ajaxobj = new AjaxObject(url, 'json');
        ajaxobj.modify_get();
    })
    $("#deletebutton").click(function () {
        var url = "ajax/ajaxCard";
        var ajaxobj = new AjaxObject(url, 'json');
        ajaxobj.delete();
    })
})

// 手機驗證
function checkPhone(value, id) {
    var phone = value;
    var regMobilePhone = new RegExp(/^1[34578]\d{9}$/);
    var regTelephone = new RegExp(/^((0\d{2,3})-?)(\d{7,8})(-(\d{3,}))?$/);
    if (!(regMobilePhone.test(phone) || regTelephone.test(phone))) {
        $(id).val("");
        alert("電話號碼格式有誤, 請重新輸入!");
    }
}

function refreshTable(data) {
    // var HTML = '';
    $("#cardtable tbody > tr").remove();
    $.each(data, function (key, item) {
        var strsex = '';
        var strphone = '';
        if (item.sex == 0)
            strsex = '男';
        else
            strsex = '女';
        
        // 讓手機格式化xxxx-xxx-xxx
        if (item.phone) {
            var num = item.phone.replace(/\D/g, '');
            strphone = num.substring(0,4) + '-' + num.substring(4,7) + '-' + num.substring(7,10);
        }
        var row = $("<tr></tr>");
        row.append($("<td></td>").html(`<span data-bs-toggle="tooltip" data-bs-placement="bottom" title="[${strsex}] ${item.cnname}(${item.enname})">${item.cnname}</span>`));
        row.append($("<td></td>").html(item.enname));
        row.append($("<td></td>").html(strsex));
        row.append($("<td></td>").html(`<a class="text-nowrap" tabindex="0" data-bs-toggle="popover" data-bs-placement="bottom"  data-bs-content="聯絡方式：${strphone}">${item.phone}</a>`));
        row.append($("<td></td>").html(item.mail));
        row.append($("<td></td>").html('<button id="modifybutton' + item.s_sn + '" class="modifybutton btn btn-secondary" data-bs-toggle="modal" data-bs-target="#editFormModal">修改 <span class="glyphicon glyphicon-list-alt"></span></button>'));
        row.append($("<td></td>").html('<button id="deletebutton' + item.s_sn + '" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#deleteFormModal">刪除 <span class="glyphicon glyphicon-trash"></span></button>'));
        $("#cardtable").append(row);
    });
}
function initEdit(response) {
    var modifyid = $("#cardtable").attr('id').substring(12);
    $("#mocnname").val(response[0].cnname);
    $("#moenname").val(response[0].enname);
    $("#modifyphone").val(response[0].phone);
    $("#modifymail").val(response[0].mail);
    if (response[0].sex == 0) {
        $("#modifyman").prop("checked", true);
        $("#modifywoman").prop("checked", false);
    }
    else {
        $("#modifyman").prop("checked", false);
        $("#modifywoman").prop("checked", true);
    }
    $("#modifysid").val(modifyid);

    // 修改按鈕
    $("#editbutton").click(function (e) {
        // $("#modifyform").submit();
        var url = "ajax/ajaxCard";
        var cnname = $("#mocnname").val();
        var enname = $("#moenname").val();
        var phone = $("#modifyphone").val();
        var mail = $("#modifymail").val();
        var sex = $('input:radio:checked[name="mosex"]').val();
        var ajaxobj = new AjaxObject(url, 'json');
        ajaxobj.cnname = cnname;
        ajaxobj.enname = enname;
        ajaxobj.sex = sex;
        ajaxobj.phone = phone;
        ajaxobj.mail = mail;
        ajaxobj.id = modifyid;
        ajaxobj.modify();

        e.preventDefault(); // avoid to execute the actual submit of the form.
    })

    // 重新填寫修改按鈕
    $("#reEditbutton").click(function () {
        $("#modifyform")[0].reset();
    })
}

/**
 * 
 * @param string
 *          url 呼叫controller的url
 * @param string
 *          datatype 資料傳回格式
 * @uses refreshTable 利用ajax傳回資料更新Table
 */
function AjaxObject(url, datatype) {
    this.url = url;
    this.datatype = datatype;
}
AjaxObject.prototype.cnname = '';
AjaxObject.prototype.enname= '';
AjaxObject.prototype.sex = '';
AjaxObject.prototype.phone = '';
AjaxObject.prototype.mail = '';
AjaxObject.prototype.id = 0;
AjaxObject.prototype.alert = function () {
    alert("Alert:");
}
AjaxObject.prototype.getall = function () {
  response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1","phone":"0912312312","mail":"test@gmail.com"}]';
  refreshTable(JSON.parse(response));
}
AjaxObject.prototype.add = function () {
  response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"52","cnname":"新增帳號","enname":"NewAccount","sex":"1","phone":"0912312312","mail":"test@gmail.com"}]';
  refreshTable(JSON.parse(response));
}
AjaxObject.prototype.modify = function () {
  response = '[{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0","phone":"0912312312","mail":"test@gmail.com"}]';
  refreshTable(JSON.parse(response));
}
AjaxObject.prototype.modify_get = function () {
  response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1","phone":"0912312312","mail":"test@gmail.com"}]';
  initEdit(JSON.parse(response));
}
AjaxObject.prototype.search = function () {
  response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0","phone":"0912312312","mail":"test@gmail.com"}]';
  refreshTable(JSON.parse(response));
}
AjaxObject.prototype.delete = function () {
  response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0","phone":"0912312312","mail":"test@gmail.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0","phone":"0912312312","mail":"test@gmail.com"}]';
  refreshTable(JSON.parse(response));
}