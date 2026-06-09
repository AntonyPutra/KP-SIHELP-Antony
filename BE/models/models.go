package models

import (
	"time"
)

type Role struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `gorm:"unique;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	RoleID    uint      `json:"role_id"`
	Role      Role      `gorm:"foreignKey:RoleID" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type TicketCategory struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

type Ticket struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Status      string         `gorm:"default:'Open'" json:"status"`
	Priority    string         `gorm:"default:'Sedang'" json:"priority"`
	CategoryID  uint           `json:"category_id"`
	Category    TicketCategory `gorm:"foreignKey:CategoryID" json:"category"`
	UserID      uint           `json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"user"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type TicketAssignment struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	TicketID uint   `json:"ticket_id"`
	Ticket   Ticket `gorm:"foreignKey:TicketID" json:"ticket"`
	UserID   uint   `json:"user_id"`
	User     User   `gorm:"foreignKey:UserID" json:"user"`
}

type TicketComment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TicketID  uint      `json:"ticket_id"`
	Ticket    Ticket    `gorm:"foreignKey:TicketID" json:"ticket"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Comment   string    `gorm:"type:text;not null" json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

type AuditLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"user_id"`
	User          User      `gorm:"foreignKey:UserID" json:"user"`
	Activity      string    `json:"activity"`
	TableName     string    `json:"table_name"`
	RecordID      uint      `json:"record_id"`
	HashSignature string    `json:"hash_signature"`
	CreatedAt     time.Time `json:"created_at"`
}

type TokenBlacklist struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Token     string    `gorm:"unique;not null;type:text" json:"token"`
	ExpiredAt time.Time `json:"expired_at"`
	CreatedAt time.Time `json:"created_at"`
}

type EmailOTP struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `json:"user_id"`
	User            User      `gorm:"foreignKey:UserID" json:"user"`
	Email           string    `gorm:"not null" json:"email"`
	OTPSessionToken string    `gorm:"not null;unique" json:"-"`
	OTP             string    `gorm:"not null" json:"-"`
	Purpose         string    `gorm:"default:'login'" json:"purpose"`
	Status          string    `gorm:"default:'pending'" json:"status"`
	Attempts        int       `gorm:"default:0" json:"attempts"`
	ResendCount     int       `gorm:"default:0" json:"resend_count"`
	LastSentAt      time.Time `json:"last_sent_at"`
	ExpiredAt       time.Time `json:"expired_at"`
	CreatedAt       time.Time `json:"created_at"`
}
