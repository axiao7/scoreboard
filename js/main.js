$(document).ready(function () {
    let flag=false;
    let regflag=false;
    let speed=1000;
    // let uiFetchedInstructions = [];
    let source = "LD F6 34 R2\r\nLD F2 45 R3\r\nMULT F0 F2 F4\r\n";
    source += "SUBD F8 F6 F2\r\nDIVD F10 F0 F6\r\nADDD F6 F8 F2";
    let model=$("#new_instructions").val(source);
    let controller= new Controller([]);
    let timeID = 0;
    uiRunSimulate();
    //更新速度
    $('#ex1').slider({
        formatter: function(value) {
            speed=(20-value)*100;
            return '当前速度: ' + speed/1000+'秒';
        }
    });



    $("#regupdate").click(function () {//更新寄存器信息
        for (let key in controller.registers) {
            let row_value = $("#" + key+"_value");
            controller.registers[key].value=row_value.val();
            $("#regdiv").attr("class","alert alert-success alert-dismissable in");
        }
        regflag=true;
    });
    $("#continue").click(function() {//继续
        window.clearTimeout(timeID);
        timeID = window.setTimeout(uiRunSimulate, 0);
    });

    $("#pause").click(function() {//暂停
        window.clearTimeout(timeID);
    });
    $("#next").click(function () {//下一周期
        window.clearTimeout(timeID);
        if(!controller.forward()&&flag)
        {flag=false;
            $("input").attr("disabled",false);
            $("#regupdate").attr("disabled",false);
            let end =$("#end");
            end.html("指令执行结束，总共执行了"+controller.clock+"个周期。");
            $("#enddiv").attr("class","alert alert-danger alert-dismissable in");
            // .removeClass('hide').addClass('in');
        }
        let count = $("#count");
        count.html(controller.clock);
        uiUpdateInstructions(controller);
        uiUpdtateFunctionUnit(controller);
        uiUpdateRegister(controller);

    });
    $("#load1").click(function () {
        flag=true;
        $("#regdiv").attr("class","alert alert-success alert-dismissable hide");
        $("input").attr("disabled",true);
        $("#regupdate").attr("disabled",true);

        $("#enddiv").removeClass('in').addClass('hide');
        if(regflag){
            controller.init2();
        }

        //加载指令
        let errorop =null;
        let new_instructions = $("#new_instructions").val().split("\n");
        try {
            new_instructions.forEach(function (instruction) {
                if (instruction == "") {
                    return;
                }
                let elements = instruction.split(" ");
                if (elements.length != 4) {
                    throw BreakException;
                }
                if (controller.isInInstructionSet(elements[0])) {
                    controller.addInstruction(new Instruction(elements[0], 
                                elements[1], elements[2], elements[3]));
                } else {
                    errorop=elements[0];
                    throw BreakException;
                }
            });
            $("#new_instructions").val("");
            let update_all_instructions = controller.getNotExecInctruction();
            $("#instruction_table").html("");
            for(let i =0;i<update_all_instructions.length;i++){
                let temp2 = "<tr>";
                temp2 += "<td>" + update_all_instructions[i].getSource() + "</td>";
                for (let j = 0; j < update_all_instructions[i].stage.length; j ++) {
                    temp2 += "<td>" + update_all_instructions[i].stage[j] + "</td>";
                }
                temp2 += "</tr>";
                $("#instruction_table").append(temp2);
            }

            window.clearTimeout(timeID);
            timeID = window.setTimeout(uiRunSimulate, 500);
        } catch(e) {
            if(errorop){
                alert("指令输入错误："+errorop);
            }else{
                alert("指令格式错误")
            }

        }
    });


    // 更新所有界面
    function uiRunSimulate() {
        if (controller.forward() ) {
            timeID = window.setTimeout(uiRunSimulate, speed);
        }else if(flag) {
            flag=false;
            $("input").attr("disabled",false);
            $("#regupdate").attr("disabled",false);
            let end =$("#end");
            end.html("指令执行结束，总共执行了"+controller.clock+"个周期。");
            $("#enddiv").attr("class","alert alert-danger alert-dismissable in");
        }
        let count = $("#count");
        count.html(controller.clock);
        uiUpdateInstructions(controller);
        uiUpdtateFunctionUnit(controller);
        uiUpdateRegister(controller);
    }

    // 更新运算部件界面
    function uiUpdtateFunctionUnit(simulator) {
        for (let key in simulator.functionUnitSet) {
            let unit = simulator.functionUnitSet[key];
            let row = $("#function_unit").find("#" + key);
            if (row.length == 0) {
                $("#function_unit").append(uiMakeUnitRow(unit));
            } else {
                uiSetUnitStage(row, unit.exec);
                for (let element in unit) {
                    let temp = row.find("." + element);
                    if (temp.length != 0) {
                        if (temp.html() != unit[element] + "") {
                            temp.html(unit[element] + "");
                        }
                    }
                }
            }
        }
    }

    function uiMakeUnitRow (unit) {
        let temp = '<tr id="' + unit.name + '">';
        temp += '<td class="name">' + unit.name + "</td>";
        temp += '<td class="busy">' + unit.busy + "</td>";
        temp += '<td class="Op">' + unit.Op + "</td>";
        temp += '<td class="Fi">' + unit.Fi + "</td>";
        temp += '<td class="Fj">' + unit.Fj + "</td>";
        temp += '<td class="Fk">' + unit.Fk + "</td>";
        temp += '<td class="Qj">' + unit.Qj + "</td>";
        temp += '<td class="Qk">' + unit.Qk + "</td>";
        temp += '<td class="Rj">' + unit.Rj + "</td>";
        temp += '<td class="Rk">' + unit.Rk + "</td>";
        temp += "</tr>";
        return temp;
    }

    function uiSetUnitStage (row, exec) {
        switch (exec) {
            case 0:
                row.css("background-color", "#FFFFFF");
                break;
            case 1:
                row.css("background-color", "rgb(52,121,182)");
                break;
            case 2:
                row.css("background-color", "rgb(251,247,227)");
                break;
            case 3:
                row.css("background-color", "rgb(216,236,246)");
                break;
            case 4:
                row.css("background-color", "rgb(241,221,221)");
                break;
        }
    }

    // 更新寄存器界面
    function uiUpdateRegister(simulator) {
        for (let key in simulator.registers) {
            let row = $("#" + key);
            row.html("<span style='background-color: red'>"+simulator.registers[key].manipulation+"</span>");
            let row_value = $("#" + key+"_value");
            row_value.val(simulator.registers[key].value+"");
        }
    }

    // 更新指令界面
    function uiUpdateInstructions(simulator) {
        let rows = $("#instruction_table").find("tr");
        for (let i = 0; i < simulator.fetched.length; i ++) {
            let instruction = simulator.fetched[i];

                let cols = $(rows[i]).find("td");
                $(cols[0]).html(instruction.getSource());
                for (let j = 0; j < instruction.stage.length; j ++) {
                    $(cols[j + 1]).html(instruction.stage[j]);

            }
        }
    }
});
