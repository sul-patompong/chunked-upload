var _endPoint = "http://localhost:60878/api/upload";
var _chunkedSize = 10240;
var _percentDigit = 0;

$(document).ready(function () {
  $("#btnUploadFile").on("click", (e) => {
    var files = $("#file")[0].files[0];

    console.log("File at button clicked", files);
    UploadFile(files);
  });

  $("#btnCheckFileInfo").on("click", (e) => {
    var files = $("#file")[0].files[0];
    var tempFile = files.slice(0, 100);

    console.log("File info: ", files);
    console.log("Temp File info: ", tempFile);
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
      if (currentPart == totalPart) assetPost(fileName);
      if (totalPart > currentPart) {
        if (data.status == true) {
          uploadFileChunk(fileChunks, fileName, currentPart + 1, totalPart);
          // console.log(`Uploading at ${currentPart} of ${totalPart}`)
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

function assetPost(fileName) {
  var body = {
    folderId: "",
    title: "Test-001",
    description: "Test-001",
    isNeedApproval: false,
    type: "etc",
    expireDate: "2021-09-21",
    tags: "Test-001",
    uploadedFileName: fileName,
  };

  $.ajax({
    type: "POST",
    url: "http://localhost:60878/api/asset",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(body),
    headers: {
      Authorization:
        "Bearer " +
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6InNhd2FydW5lZUBjZW50cmFscGF0dGFuYS5jby50aCIsInVzZXJJZCI6ImRiM2FlOWM0LTI5M2UtNDNmMi1hOWJiLTIzMTdiZDM2NDQyOCIsIm5iZiI6MTY0Nzg1MzI4NSwiaWF0IjoxNjMyMjE0ODg1LCJleHAiOjE2MzIyMjIwODV9.snrZFIXcoODCwKEudAx-naQGvavy6DwzFzohQD-fdUM",
    },
    success: function (data) {
      console.log("success");
    },
    error: function () {
      // Some error while uploading the file
      console.log("Error");
    },
  });
}
