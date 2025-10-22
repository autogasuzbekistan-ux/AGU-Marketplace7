<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Role: owner, admin, kontragent, customer
            $table->enum('role', ['owner', 'admin', 'kontragent', 'customer'])
                  ->default('customer')
                  ->after('email');
            
            // Region - Kontragentlar uchun (12 viloyat)
            $table->string('region')->nullable()->after('role');
            
            // Active/Inactive status
            $table->boolean('is_active')->default(true)->after('region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'region', 'is_active']);
        });
    }
};