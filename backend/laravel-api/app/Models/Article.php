<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title', 'url', 'content', 'excerpt', 'author', 
        'published_at', 'is_updated', 'updated_content', 'reference_articles'
    ];
    
    protected $casts = [
        'reference_articles' => 'array',
        'published_at' => 'datetime',
        'is_updated' => 'boolean'
    ];
}