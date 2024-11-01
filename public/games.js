var boards = [];
for (let i = 0; i < $("[id^='board']").length; i++){
    console.log(i)
    let finalFen = document.getElementById("board" + i).getAttribute("data-fen");
    console.log(finalFen)
    boards[i] =  Chessboard2('board' + i, {
        position: finalFen,
        showNotation: false
      });
}