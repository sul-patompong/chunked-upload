using System.Web.Http;

namespace chunked_upload_api.Controllers
{

    public class ChunkUploadController : ApiController
    {
        [HttpPost]
        public IHttpActionResult Post()
        {
            return Ok("return from post method");
        }
    }
}