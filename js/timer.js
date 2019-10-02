// function startTimer() {
//     var timer = document.getElementById("timer").innerHTML;
//     var arr = timer.split(":");
//     var min = arr[0];
//     var sec = arr[1];

//     if (sec == 0) {
//         if (min == 0) {
//             alert("Time out");
//             window.location.reload();
//             return
//         }
//         min++;
//         if (min < 10) {
//             min = "0" + min;
//         }
//         sec = 59;
//     }
//     else {
//         sec--;
//     }

//     if (sec < 10) {
//         sec = "0" + sec;
//     }

//     document.getElementById("timer").innerHTML = min + ":" + sec;
//     setTimeout(startTimer,1000);
// }
