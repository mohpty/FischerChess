<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FischerChess</title>
    <link rel="stylesheet"
      href="https://unpkg.com/@chrisoakman/chessboard2@0.5.0/dist/chessboard2.min.css"
      integrity="sha384-47VeTDpmy4yT21gKPXQcLQYQZwlmz27gEH5NTrOmTk3G/SGvMyltclOW/Q8uE+sL"
      crossorigin="anonymous">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <nav class="navbar navbar-expand-lg ">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">FischerChess</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/play">Play</a>
              </li>

              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Dropdown
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">Action</a></li>
                  <li><a class="dropdown-item" href="#">Another action</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
              </li>



            </ul>
            

            <a class="nav-item mx-4" href='/login'>Login</a>
          </div>
        </div>
      </nav>
    



    <div id="app">
        <?php echo $__env->yieldContent('content'); ?>
    </div>
    <div id="myBoard" style="width: 400px"></div>

    <script src="https://code.jquery.com/jquery-3.5.1.min.js"
        integrity="sha384-ZvpUoO/+PpLXR1lu4jmpXWu80pZlYUAfxl5NsBMWOEPSjUn/6Z/hRTt8+pR6L4N2"
        crossorigin="anonymous"></script>

    <script type="module">
      import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
    </script>

    <script src="https://unpkg.com/@chrisoakman/chessboard2@0.5.0/dist/chessboard2.min.js"
        integrity="sha384-/KwQCjA1GWovZNV3QDVtvSMDzO4reGgarF/RqHipr7hIUElH3r5zNl9WEPPOBRIF"
        crossorigin="anonymous"></script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.1/chess.js"
  integrity="sha384-8sJV/krC8iV2g7t0PolQxFVckDtxhfM5gNHNAFPG2ZS/bScudOjfsB8ewhG2xle8"
  crossorigin="anonymous"></script>

<div class="chessBoard">
  <div id="myBoard" style="width: 400px"></div>
</div>
<div id="gamePGN" style="font-family: monospace"></div>
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
<script type="module" src="/main.js"></script>
<script type="module" src="/online.js"></script>
</body>
</html>
<?php /**PATH /home/mohpty/Code/chess/laravelFischerChess/FischerChess/resources/views/layouts/template.blade.php ENDPATH**/ ?>