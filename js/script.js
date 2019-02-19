function urlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

var pattern = Trianglify({
  height: $("body").height(),
  width: $("body").width()});

document.body.appendChild(pattern.canvas());

if(urlParams().room){
  var room = urlParams().room;
  $(".container").empty().append("<h1>"+room+"</h1>");
}

$(window).on('resize', function(){
    var newPattern = Trianglify({
      cell_size: pattern.opts.cell_size,
      variance: pattern.opts.variance,
      x_colors: pattern.opts.x_colors,
      y_colors: pattern.opts.y_colors,
      palette: pattern.opts.palette,
      color_space: pattern.opts.color_space,
      color_function: pattern.opts.color_function,
      stroke_width: pattern.opts.stroke_width,
      seed: pattern.opts.seed,
      height: $("body").height(),
      width: $("body").width()});
    $("body > canvas").remove();
    document.body.appendChild(newPattern.canvas())
});

$("#enter").on("click", function(){
  var input = $("#roomInput").val();
  $(".loader").attr("style", "display:inline");
      setTimeout(function() {
        $.ajax({
          url: "https://api.backand.com/1/query/data/getRoom?parameters=%7B%22room%22:%22"+input+"%22%7D",
          dataType: 'json',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('AnonymousToken', "4fb475a7-6a1a-45d3-92ba-ad8aecf44f71");
          },
          success: function(data) {
            if(data.length > 0){
              $(".loader").hide();
              swal({
                title: "Select your username:",
                text: "",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Write something"
              },
              function(inputValue){
                if (inputValue === false) return false;
                
                if (inputValue === "") {
                  swal.showInputError("You need to write something!");
                  return false
                }
                location.replace("/room/" + input);
              }); 
            }
            else{
              $(".loader").hide();
              swal("Oops...", "There is no open room with this code :(", "error");
            }
          },
          error: function(e){
            $(".loader").hide();
            alert(JSON.stringify(e));
          }
          
        })
        
        
      }, 1000);
});

$("#create").on("click", function(){
  var roomCode = randomRoom();
  $(".loader").attr("style", "display:inline");
  var postData = {
    code: roomCode,
    isOpen: true
  };
      setTimeout(function() {
        $.ajax({
          url: "https://api.backand.com/1/query/data/getRoom?parameters=%7B%22room%22:%22"+roomCode+"%22%7D",
          dataType: 'json',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('AnonymousToken', "4fb475a7-6a1a-45d3-92ba-ad8aecf44f71");
          },
          success: function(data) {
            if(data.length === 0){
              $.ajax({
                url: "https://api.backand.com:443/1/objects/rooms",
                type: "post",
                data: JSON.stringify(postData),
                dataType: 'json',
                beforeSend: function (xhr) {
                  xhr.setRequestHeader('AnonymousToken', "4fb475a7-6a1a-45d3-92ba-ad8aecf44f71");
                },
                success: function(data) {
                    $(".loader").hide();
                    swal({
                      title: "Select your username:",
                      text: "",
                      type: "input",
                      showCancelButton: true,
                      closeOnConfirm: false,
                      animation: "slide-from-top",
                      inputPlaceholder: "Write something"
                    },
                    function(inputValue){
                      if (inputValue === false) return false;
                      
                      if (inputValue === "") {
                        swal.showInputError("You need to write something!");
                        return false
                      }
                    }); 
                  },
                error: function(e){
                  $(".loader").hide();
                  alert(JSON.stringify(e));
                }
              })
            }
            else{
              swal("Oops...", "Something went wrong. Try again.", "error");
            }
          },
          error: function(e){
            $(".loader").hide();
            alert(JSON.stringify(e));
          }
          
        })
        
        
      }, 1000);
});

function randomRoom()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
