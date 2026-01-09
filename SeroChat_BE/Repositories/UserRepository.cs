using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Interfaces;
using SeroChat_BE.Models;

namespace SeroChat_BE.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly SeroChatContext _context;

        public UserRepository(SeroChatContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsDeleted == false);
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && u.IsDeleted == false);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email && u.IsDeleted == false);
        }
    }
}
