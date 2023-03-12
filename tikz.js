function getTikz() {

    function addRect(x1, y1, x2, y2) {
        return `\\fill[gray] (${x1},${y1}) rectangle (${x2},${y2});\n` 

    }

    function addLine(x1, y1, x2, y2) {
        return `\\draw[black, thick] (${x1},${y1}) -- (${x2},${y2});\n` 
    }

    function addText(x, y, text) {
        return `\\node[align=left] at (${x},${y}) {${text}};\n` 
    }

    function addArrowUp(x, y) {
        return `\\draw[black, fill=black] (${x - 0.1}, ${y+0.4}) -- (${x},${y+0.6}) -- (${x + 0.1},${y+0.4}) -- cycle;\n`;
    }

    function addArrowDown(x, y) {
        return `\\draw[black, fill=black] (${x - 0.1}, ${y+0.2}) -- (${x},${y}) -- (${x + 0.1},${y+0.2}) -- cycle;\n`;
    }


    function checkDeadlineMiss(schedule, deadlineEvent) {
        if (schedule.events.filter(event => event.task == deadlineEvent.task &&
            event.job == deadlineEvent.job && event.eventType == 'F' && 
            event.timestamp > deadlineEvent.timestamp).length)
            return true;
        else return false;
    }

    var content = "";
    content += "\\begin{tikzpicture}\n";


    for (let task = 1; task <= schedule.numTasks; task++) {
        let startEvents = schedule.events.filter(event => event.eventType == 'S' && event.task == task);
        let finishEvents = schedule.events.filter(event => event.eventType == 'F' && event.task == task);

        for (let i = 0; i < startEvents.length; i++) {
            if (startEvents[i].timestamp > zoom.zoomStart + schedule.length / zoom.amount) break;
            let finishTime;
            if (i < finishEvents.length) finishTime = Math.min(zoom.zoomStart + schedule.length / zoom.amount, finishEvents[i].timestamp);
            else finishTime = zoom.zoomStart + schedule.length / zoom.amount;
           // svg.appendChild(jobBox(task, startEvents[i].timestamp, finishTime));


            content += addRect(
                startEvents[i].timestamp * 10 / schedule.length,
                startEvents[i].task - 1,
                finishTime * 10 / schedule.length,
                startEvents[i].task - 1 + 0.6
            );
            content += addText(startEvents[i].timestamp * 10 / schedule.length, startEvents[i].task - 1.2, String(startEvents[i].timestamp));
        }
    }

    // Draw jobs
    // schedule.events.filter(event => event.eventType == 'S' && event.timestamp < zoom.zoomStart + schedule.length / zoom.amount).forEach(startEvent => {
    //     finishEvent = schedule.events.filter(event => event.eventType == 'F' && event.task == startEvent.task && event.job == startEvent.job)[0];
    //     let jobBoxFinish = Math.min(finishEvent ? finishEvent.timestamp : schedule.length, zoom.zoomStart + schedule.length / zoom.amount)
    //     svg.appendChild(jobBox(startEvent.task, startEvent.timestamp, jobBoxFinish));
    //     console.log(startEvent.task, startEvent.timestamp, finishEvent.timestamp);
    //     console.log(startEvent, finishEvent);
    // });

    // Draw Activation and deadline events
    schedule.events.forEach(event => {
        // Add time label to event
        let timeLabelOffset = String(event.timestamp).length > 1 ? 8 : 4;
     //   svg.appendChild(svgText(xPosFromTimestamp(event.timestamp) - timeLabelOffset, yTaskBase(event.task) + 15, String(event.timestamp)));

        switch (event.eventType) {
            case 'A': // Activation
            
            console.log("Adding line at", event.timestamp);
            content += addLine(event.timestamp * 10 / schedule.length, event.task - 1, event.timestamp * 10 / schedule.length, event.task - 0.4);
            content += addArrowUp(event.timestamp * 10 / schedule.length, event.task - 1);
            content += addText(event.timestamp * 10 / schedule.length, event.task - 1.2, String(event.timestamp));
            break;
            case 'D': // Deadline
                let deadlineMiss = checkDeadlineMiss(schedule, event);
                let arrowColor = deadlineMiss ? 'red' : 'black'

                content += addLine(event.timestamp * 10 / schedule.length, event.task - 1, event.timestamp * 10 / schedule.length, event.task - 0.4);
                content += addArrowDown(event.timestamp * 10 / schedule.length, event.task - 1);
            content += addText(event.timestamp * 10 / schedule.length, event.task - 1.2, String(event.timestamp));

             //   svg.appendChild(arrowLine(event.task, event.timestamp, arrowColor));
             //   svg.appendChild(arrowHeadDown(event.task, event.timestamp, arrowColor));
            break;
        }
    });


    // Draw horizontal axis for each task
    for (let i = 0; i < schedule.numTasks; i++) {
        content += addLine(0, i, 10, i);
        content += addText(-0.3, i + 0.2, '$\\tau$' + String(i + 1));
    }

    content += "\\end{tikzpicture}\n";
    console.log(content);


    navigator.clipboard.writeText(content);
    alert("Tikz code copied to clipboard.");


}

