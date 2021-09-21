using System;
using System.IO;
using System.Web;
using System.Web.Http;

namespace chunked_upload_api.Controllers
{

    public class ChunkUploadController : ApiController
    {
        [HttpPost]
        public IHttpActionResult Post()
        {
            var files = HttpContext.Current.Request.Files;

            if (files.Count > 0)
            {
                try
                {
                    var filePath = Path.Combine(GetUploadPath(), files[0].FileName);

                    using (FileStream fs = new FileStream(filePath, FileMode.Append))
                    {
                        var bytes = GetBytes(files[0].InputStream);
                        fs.Write(bytes, 0, bytes.Length);
                    }

                    return Json(new { status = true });

                }
                catch (Exception e)
                {
                    return Json(new { status = false, message = e.Message });
                }
            }

            System.Diagnostics.Debug.WriteLine(files[0].FileName);
            return Json(new { status = false });

        }

        private byte[] GetBytes(Stream input)
        {
            byte[] buffer = new byte[input.Length];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }

                return ms.ToArray();
            }
        }

        private string GetUploadPath()
        {
            var rootPath = System.Web.Hosting.HostingEnvironment.MapPath("~/UploadedFiles/");

            if (!Directory.Exists(rootPath))
            {
                Directory.CreateDirectory(rootPath);
            }

            return rootPath;
        }
    }
}