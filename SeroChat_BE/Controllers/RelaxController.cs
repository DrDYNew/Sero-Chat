using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RelaxController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<RelaxController> _logger;

        public RelaxController(SeroChatContext context, ILogger<RelaxController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Relax/assets
        [HttpGet("assets")]
        public async Task<ActionResult> GetRelaxAssets([FromQuery] string? type = null)
        {
            try
            {
                var query = _context.RelaxAssets
                    .Where(a => a.IsDeleted != true);

                // Filter by type if provided (MUSIC, BREATHING, MEDITATION)
                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(a => a.Type == type.ToUpper());
                }

                var assets = await query
                    .OrderBy(a => a.IsPremium) // Free first
                    .ThenBy(a => a.AssetId)
                    .Select(a => new
                    {
                        assetId = a.AssetId,
                        title = a.Title,
                        type = a.Type,
                        mediaUrl = a.MediaUrl,
                        thumbnailUrl = a.ThumbnailUrl,
                        isPremium = a.IsPremium ?? false,
                        createdAt = a.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = assets,
                    count = assets.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting relax assets");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving relax assets"
                });
            }
        }

        // GET: api/Relax/assets/{id}
        [HttpGet("assets/{id}")]
        public async Task<ActionResult> GetRelaxAssetById(int id)
        {
            try
            {
                var asset = await _context.RelaxAssets
                    .Where(a => a.AssetId == id && a.IsDeleted != true)
                    .Select(a => new
                    {
                        assetId = a.AssetId,
                        title = a.Title,
                        type = a.Type,
                        mediaUrl = a.MediaUrl,
                        thumbnailUrl = a.ThumbnailUrl,
                        isPremium = a.IsPremium ?? false,
                        createdAt = a.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (asset == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Asset not found"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = asset
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting relax asset {AssetId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving asset"
                });
            }
        }
    }
}
