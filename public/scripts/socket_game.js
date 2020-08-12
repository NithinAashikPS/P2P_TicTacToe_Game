global.socket = io("/");

function init(data) {
    socket.emit("init", data);
}

var user, comp, playing, gameBoard;
var socket_data;
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

socket.on("win", (data) => {
  $('.yourTurn').hide();
});

//update board onscreen and control win logic
function placeMark(mark, location) {
    if (playing == true) {
      $('#' + location).html('<div class="' + mark + '"</div>')
      gameBoard[location] = mark;

      if (checkWin(location, gameBoard)) {
        //console.log(mark + ' wins!');
        playing = false;
        if (socket_data.u == mark) {
          $('#modal-text').html('<p class="winner">You won the Game</p><p>You earned 20 rupees</p>');
        } else {
          $('#modal-text').html('<p class="winner">You loss the Game</p><p>You lost 10 rupees</p>');
        }

        socket.emit("set_win", socket_data);
        $('.overlay').fadeIn();
        $('body').addClass('overlay-on');
      }
      if (Object.keys(gameBoard).length == 9) {
        //console.log('game over')
        playing = false;
        
        $('#modal-text').html('<p class="winner">You two players not won the game.</p><p>Your betting amount is safe now.</p>');
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

$(document).ready(function() {
  var id = $("#modal-text").text();
  init(id);
  $('.start').on('click', function() {
    gameBoard = {};
    $('.cell').html('');
    playing = true;
    $('.overlay').hide();
    $('body').removeClass('overlay-on');

    // if($(this).is('#x')) {
    //   init('x');
    //   user = 'x';
    //   handleClick();
    // } else {
    //   init('o');
    //   user = 'o';
    // }

  });

  function handleClick() {
      //user places mark on board
    $('.alert').css({"visibility":"visible"});
    $('.yourTurn').fadeIn();
    $('.cell').on('click', function(mark) {
      var id = parseInt($(this).attr('id'));
      if (!gameBoard[id]) { //check if cell empty
        $(this).removeClass('pointer'); //class no longer toggled after mark is placed
        socket_data.u = user;
        socket_data.i = id;
        socket.emit("play", socket_data);
        placeMark(user, id);
      }
      $('.yourTurn').fadeOut();
      $('.cell').unbind("click");
    }); 
  }

  socket.on("set", (data) => {
    console.log(data.u);
    console.log(data.i);
    const u = data.u;
    const i = data.i;
    placeMark(u, i);
    $("#"+i).removeClass('pointer'); //class no longer toggled after mark is placed
    handleClick();
  });

  socket.on("opponent", (data) => {
    socket_data = data;
    console.log(socket_data.socket);
    console.log(socket_data.you);
    console.log(socket_data.opp);

    gameBoard = {};
    $('.cell').html('');
    playing = true;
    $('.overlay').hide();
    $('body').removeClass('overlay-on');

    user = socket_data.you;
    if(user == "x") {
      handleClick();
    } 

  });

  //pointer change on empty cell
  $('.cell').hover(function() {
    if (!gameBoard[$(this).attr('id')]) {
      $(this).toggleClass('pointer');
    }
  });

});