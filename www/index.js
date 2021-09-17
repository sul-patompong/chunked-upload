var _endPoint = "https://localhost:44375/api/ChunkUpload";
var _chunkedSize = 500;
var _percentDigit = 0;

$(document).ready(function () {
  $("#btnUploadFile").on("click", (e) => {
    var files = $("#file")[0].files[0];

    console.log("File at button clicked", files);
    UploadFile(files);
  });
});

function ShowUploadProgress(current, total) {
  var percent = (current * 100) / total;

  $("#text").text(
    "Uploading chunked file at " + percent.toFixed(_percentDigit) + " %"
  );
}

function UploadFile(file) {
  var maxFileSizeKB = _chunkedSize;

  var fileChunks = [];
  var bufferChunkSizeInBytes = maxFileSizeKB * 1024;

  var currentStreamPosition = 0;
  var endPosition = bufferChunkSizeInBytes;
  var size = file.size;

  while (currentStreamPosition < size) {
    fileChunks.push(file.slice(currentStreamPosition, endPosition));
    currentStreamPosition = endPosition;
    endPosition = currentStreamPosition + bufferChunkSizeInBytes;
  }

  //Append random number to file name to make it unique
  var fileName = Math.random() + "_" + file.name;
  uploadFileChunk(fileChunks, fileName, 1, fileChunks.length);
}

function uploadFileChunk(fileChunks, fileName, currentPart, totalPart) {
  var formData = new FormData();
  formData.append("file", fileChunks[currentPart - 1], fileName);

  $.ajax({
    type: "POST",
    url: _endPoint,
    contentType: false,
    processData: false,
    data: formData,
    success: function (data) {
      // To update the progress use `currentPart` as the current part of the chunked files and `totalPart` is the total of chunked files
      ShowUploadProgress(currentPart, totalPart);
      if (totalPart > currentPart) {
        if (data.status == true) {
          uploadFileChunk(fileChunks, fileName, currentPart + 1, totalPart);
        } else {
          // Failed to upload file
          console.log("failed to upload file part no: " + currentPart);
        }
      }
    },
    error: function () {
      // Some error while uploading the file
      console("error to upload file part no: " + currentPart);
    },
  });
}
