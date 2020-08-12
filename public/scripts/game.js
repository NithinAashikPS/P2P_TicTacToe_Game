var user, comp, playing, gameBoard;
var winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

//update board onscreen and control win logic
function placeMark(mark, location) {
    if (playing == true) {
      $('#' + location).html('<div class="' + mark + '"</div>')
      gameBoard[location] = mark;

      if (checkWin(location, gameBoard)) {
        //console.log(mark + ' wins!');
        playing = false;
        $('#modal-text').html('<p class="winner">' + mark.toUpperCase() + ' wins!</p><p>Would you like to play again?</p>');

        $('.overlay').fadeIn();
        $('body').addClass('overlay-on');
      }
      if (Object.keys(gameBoard).length == 9) {
        //console.log('game over')
        playing = false;
        
        $('#modal-text').html("<p>It's a tie.</p><p>Would you like to play again?</p>");
        $('.overlay').fadeIn();
        $('body').addClass('overlay-on');
      }
    }
  }
//loop over array of winning patterns and see if board matches
function checkWin(cell, board) {
    for (var i = 0, len = winPatterns.length; i < len; i++) {
      //check if move was in that winPattern to avoid nulls matching
      if (winPatterns[i].indexOf(cell) > -1) {
        if (board[winPatterns[i][0]] == board[winPatterns[i][1]] &&
          board[winPatterns[i][1]] == board[winPatterns[i][2]]) {
          return true;
        }
      }
    }
    return false;
  }
//computer ai
function compPlay() {
  /*****helper functions for compPlay*****/
  function copyBoard(board) {
      var newBoard = {};
      for (var index in board) {
        newBoard[index] = board[index]
      }
      return newBoard;
    }  
  //create array of empty spaces on board
  function availableArr(board) {
    var available = [];
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        available.push(i);
      }
    }
    return available;
  }
  //return integer of random empty location
  function randomChoice(board) {
    var available = availableArr(board);
    return available[Math.floor(Math.random() * available.length)];
  }
  //update board logic for ai choice
  function simMark(mark, location, board) {
    board[location] = mark;
  }
  //returns score of simulated game
  function simGame(startingMove, board) {
    var move;
    simMark(comp, startingMove, board)
      //if starting move wins, return highest score
    if (checkWin(startingMove, board)) {
      return 100
    }
    while (Object.keys(board).length < 9) {
      move = randomChoice(board);
      simMark(user, move, board)
      if (checkWin(move, board)) { 
        return 0; //user wins
      }
      if (Object.keys(board).length < 9) { //make sure last move wasn't #9
        move = randomChoice(board);
        simMark(comp, move, board);
        if (checkWin(move, board)) {
          return 20; //comp wins
        }
      }
    }
    return 20; //tie
  }
  /*****end helper functions for compPlay*****/
  var available = availableArr(gameBoard);
  var score = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0
    } //keep score of best move to make
    //run simulation on each available spot n times
  for (var i = 0, len = available.length; i < len; i++) {
    for (var n = 0; n < 100; n++) {
      score[available[i]] += simGame(available[i], copyBoard(gameBoard));
    }
  }
  //array of score indexes in string format sorted low to high
  var sortedArray = Object.keys(score).sort(function(a, b) {
    return score[a] - score[b]
  }); //
  //make move
  var testMove = sortedArray.pop();
    // console.log(score);
    // console.log(testMove);
  placeMark(comp, parseInt(testMove));
}
/*** User controls/initialization ***/
$(document).ready(function() {
  $('.start').on('click', function() {
    gameBoard = {};
    $('.cell').html('');
    playing = true;
    $('.overlay').hide();
    $('body').removeClass('overlay-on');
    if($(this).is('#x')) {
      user = 'x';
      comp = 'o';
    } else {
      user = 'o';
      comp = 'x';
      compPlay();
    }
  });

  //user places mark on board
  $('.cell').on('click', function(mark) {
    var id = parseInt($(this).attr('id'));
    if (!gameBoard[id]) { //check if cell empty
      placeMark(user, id);
      $(this).removeClass('pointer'); //class no longer toggled after mark is placed
      compPlay();
    }
  }); 
  //pointer change on empty cell
  $('.cell').hover(function() {
    if (!gameBoard[$(this).attr('id')]) {
      $(this).toggleClass('pointer');
    }
  });
});