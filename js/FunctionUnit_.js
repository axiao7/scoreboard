class FunctionUnit {

    constructor (name, execTime) {
        this.name = name; //运算部件名称
        this.busy = false;//记录运算部件是否占用，true为占用
        this.Op = "";//指令名称
        this.Fi = "";//目标寄存器编号
        this.Fj = "";//源寄存器1编号
        this.Fk = "";//源寄存器2编号
        this.Qj = "";//产生源寄存器Fj的功能部件
        this.Qk = "";//产生源寄存器Fk的功能部件
        this.Rj = "Yes";//表示Fj是否就绪，就绪为Yes
        this.Rk = "Yes";//表示Fk是否就绪，就绪为Yes
        this.exec = 0;//指令运行阶段，0：当前功能部件未占用 1：指令流出 2：读操作数 3：执行 4：写回 5：当前指令执行结束
        this.execTime = execTime;   // 指令执行需要的周期，加法、乘法、除法功能部件分别为2,10,40，在实例化时传入
        this.execStart = 0; // 当前指令开始执行的时间
        this.currentInstruction = null; // 当前指令
    }

    //初始化功能部件
    clear () {
        this.busy = false;
        this.Op = "";
        this.Fi = "";
        this.Fj = "";
        this.Fk = "";
        this.Qj = "";
        this.Qk = "";
        this.Rj = "Yes";
        this.Rk = "Yes";
        this.exec = 0;
        this.execStart = 0;
        this.currentInstruction = null;
    }

    //加载一条指令
    loadInstruction (instruction, registers, clock) {
        if (this.exec != 0) {//功能部件已占用
            return false;
        }

        if (registers[instruction.dest].state) { //目标寄存器被占用，即发生 WRW 冲突.
            return false;
        }

        // 成功加载当前指令，记录当前指令的指令流出时间，更新功能部件和目标寄存器占用状态
        instruction.setIssue(clock);
        this.currentInstruction = instruction;
        this.busy = true;
        this.exec = 1;
        this.Op = instruction.Op;
        this.Fi = instruction.dest;
        registers[instruction.dest].manipulation = this.name;
        registers[instruction.dest].state = true;
        // 根据当前指令源寄存器状态，更新功能部件的Rj，Rk，Qj，Qk的值
        if (!!registers[instruction.source_1]) {
            this.Fj = instruction.source_1;
            registers[this.Fj].read = clock;
            if (registers[this.Fj].state == false) {//寄存器可用
                this.Rj = "Yes";
                this.Qj = "";
            } else {
                this.Rj = "No";
                this.Qj = registers[this.Fj].manipulation;
            }
        }
        if (!!registers[instruction.source_2]) {
            this.Fk = instruction.source_2;
            registers[this.Fk].read = clock;
            if (registers[this.Fk].state == false) {
                this.Rk = "Yes";
                this.Qk = "";
            } else {
                this.Rk = "No";
                this.Qk = registers[this.Fk].manipulation;
            }
        }
        return true;
    }

    //功能部件随着时钟周期，运行下一个指令阶段
    forwardPipeline (registers, clock) {
        // 当前功能部件未加载指令或指令已执行结束
        if (this.exec == 0 || this.exec == 5) {
            return;
        }
        // 源寄存器可用
        if (this.Rj =="Yes"&& this.Rk=="Yes") {
            // 执行指令下一阶段
            if (this.exec == 1) {//当前阶段是指令流出，进行下一阶段读操作数
                this.currentInstruction.setOperand(clock);
                this.exec++;
                this.execStart = clock;

                // 设置源寄存器为0，表示结束占用状态
                if (registers[this.Fj] && this.currentInstruction.issueTime() == registers[this.Fj].read) {
                    registers[this.Fj].read = 0;
                }
                if (registers[this.Fk] && this.currentInstruction.issueTime() == registers[this.Fk].read) {
                    registers[this.Fk].read = 0;
                }
            } else if (this.exec == 2) {//当前阶段是读操作数，进行下一阶段执行
                this.currentInstruction.setExec(clock);
                // 时间达到指令执行所需时间后（加法2，乘法10，除法40），开始执行指令，
                if (clock - this.execStart >= this.execTime) {
                    this.exec++;
                    switch (this.currentInstruction.Op) {
                        case "LD":
                            this.currentInstruction.temp = registers[this.currentInstruction.source_2].value;
                            break;
                        case "MULT":
                            this.currentInstruction.temp = parseFloat(registers[this.currentInstruction.source_1].value) * parseFloat(registers[this.currentInstruction.source_2].value);
                            break;
                        case "SUBD":
                            this.currentInstruction.temp = parseFloat(registers[this.currentInstruction.source_1].value) - parseFloat(registers[this.currentInstruction.source_2].value);
                            break;
                        case "DIVD":
                            this.currentInstruction.temp = parseFloat(registers[this.currentInstruction.source_1].value) / parseFloat(registers[this.currentInstruction.source_2].value);
                            break;
                        case "ADDD":
                            this.currentInstruction.temp = parseFloat(registers[this.currentInstruction.source_1].value) + parseFloat(registers[this.currentInstruction.source_2].value);
                            break

                    }
                }
            } else if (this.exec == 3) {//当前阶段是执行，进行下一阶段写回
                this.currentInstruction.setWrite(clock);
                registers[this.currentInstruction.dest].value = parseFloat(this.currentInstruction.temp).toFixed(1);
                //在写回之前，没有其他指令要读，则写回
                if (registers[this.Fi].read == 0 ||
                    this.currentInstruction.issueTime() < registers[this.Fi].read) {
                    this.exec++;
                    registers[this.Fi].clear();
                }
            } else {
                this.clear();
            }
        }
        return;
    }

    //更新功能部件信息
    updateInfo (registers) {
        if (this.exec != 1) {
            return;
        }
        if (this.Rj=="Yes" && this.Rk=="Yes") {
            return;
        }
        if (this.Rj=="No" && !registers[this.Fj].state) {
            this.Qj = "";
            this.Rj = "Yes";
        }
        if (this.Rk=="No" && !registers[this.Fk].state) {
            this.Qk = "";
            this.Rk = "Yes";
        }
    }

}