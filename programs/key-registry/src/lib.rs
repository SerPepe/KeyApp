use anchor_lang::prelude::*;

declare_id!("96hG67JxhNEptr1LkdtDcrqvtWiHH3x4GibDBcdh4MYQ");

#[program]
pub mod key_registry {
    use super::*;

    /// Register a new username for the caller's public key
    pub fn register_username(
        ctx: Context<RegisterUsername>, 
        username: String,
        encryption_key: [u8; 32],
    ) -> Result<()> {
        // Validate username
        require!(
            username.len() >= 3 && username.len() <= 20,
            KeyError::InvalidUsernameLength
        );
        require!(
            username.chars().all(|c| c.is_ascii_alphanumeric() || c == '_'),
            KeyError::InvalidUsernameCharacters
        );

        // Initialize the username account
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.owner.key();
        user_account.username = username.to_lowercase();
        user_account.created_at = Clock::get()?.unix_timestamp;
        user_account.bump = ctx.bumps.user_account;
        user_account.encryption_key = encryption_key;

        msg!("Username @{} registered for {}", username, ctx.accounts.owner.key());
        
        Ok(())
    }

    /// Lookup a username to get the owner's public key
    pub fn lookup_username(_ctx: Context<LookupUsername>) -> Result<()> {
        // The account data is returned automatically by Anchor
        // This instruction is mainly for on-chain verification
        Ok(())
    }

    /// Transfer username ownership (optional - for future use)
    pub fn transfer_username(ctx: Context<TransferUsername>, new_owner: Pubkey) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        
        require!(
            user_account.owner == ctx.accounts.current_owner.key(),
            KeyError::NotOwner
        );

        user_account.owner = new_owner;
        
        msg!(
            "Username @{} transferred from {} to {}",
            user_account.username,
            ctx.accounts.current_owner.key(),
            new_owner
        );

        Ok(())
    }

    /// Close/release a username account
    /// The rent lamports are returned to the owner
    /// This allows the username to be claimed by someone else
    pub fn close_account(ctx: Context<CloseAccount>, _username: String) -> Result<()> {
        let user_account = &ctx.accounts.user_account;
        
        require!(
            user_account.owner == ctx.accounts.owner.key(),
            KeyError::NotOwner
        );

        msg!(
            "Username @{} released by {}",
            user_account.username,
            ctx.accounts.owner.key()
        );

        // Account will be closed automatically by Anchor's close constraint
        Ok(())
    }
    pub fn update_encryption_key(
        ctx: Context<UpdateEncryptionKey>,
        new_encryption_key: [u8; 32],
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;

        require!(
            user_account.owner == ctx.accounts.owner.key(),
            KeyError::NotOwner
        );

        user_account.encryption_key = new_encryption_key;

        msg!("Encryption key updated for @{}", user_account.username);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterUsername<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"username", username.to_lowercase().as_bytes()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct LookupUsername<'info> {
    #[account(
        seeds = [b"username", username.to_lowercase().as_bytes()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct TransferUsername<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub current_owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct CloseAccount<'info> {
    #[account(
        mut,
        seeds = [b"username", username.to_lowercase().as_bytes()],
        bump = user_account.bump,
        close = owner  // Returns rent to owner
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateEncryptionKey<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    /// Owner's public key
    pub owner: Pubkey,
    
    /// The username (lowercase, 3-20 chars)
    #[max_len(20)]
    pub username: String,
    
    /// Unix timestamp of registration
    pub created_at: i64,
    
    /// PDA bump seed
    pub bump: u8,
    
    // NEW: X25519 encryption public key (32 bytes)
    pub encryption_key: [u8; 32],
}

#[error_code]
pub enum KeyError {
    #[msg("Username must be 3-20 characters")]
    InvalidUsernameLength,
    
    #[msg("Username can only contain letters, numbers, and underscores")]
    InvalidUsernameCharacters,
    
    #[msg("Username already taken")]
    UsernameTaken,
    
    #[msg("Only the owner can perform this action")]
    NotOwner,
}
