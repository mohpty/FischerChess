<?php $__env->startSection('content'); ?>
<section>
    <div class="container">
        <div class="row">
            <div class="col-12 ">
                <div class="matchMakingButtons mx-auto text-center py-4">
                    <button id='createGame' class='btn btn-primary'>Create game</button>
                    <br>
                    <input id='gameId' type="number" placeholder="Enter Room Id">
                    <button id='joinGame' class='btn btn-success my-2'>Join game</button>
                </div>
                <div id='matchMakingStatus' class="container mx-auto text-center">
                </div>
            </div>
            <div class="col-10">
                <div class="container mx-auto py-4" style="width:540px">
                    <div class="chessBoard">
                        <div id="myBoard" style="width: 400px"></div>
                        <p id="gameStatus"></p>
                        <h4>Game PGN:</h4>
                        <div id="gamePGN" style="font-family: monospace"></div>
                    </div>
                </div>
            </div>
            <div class="col-2">
                <div class="container">
                <div class='whitePlayer'></div>
                <div class='blackPlayer'></div>
                </div>
            </div>
        </div>
    </div>
</section>
<?php echo app('Illuminate\Foundation\Vite')('/resources/js/main.js'); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.template', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH /home/mohpty/Code/chess/FischerChess/resources/views/play.blade.php ENDPATH**/ ?>