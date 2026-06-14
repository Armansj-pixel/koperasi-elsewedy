import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nik, password, nama, role, userId } = body;

    if (!nik || !password || !nama || !role || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createServiceClient();

    // Cek user Supabase Auth lama
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingUser = authUsers.users.find((u) => u.email === `${nik}@koperasi.local`);

    // Hapus user lama jika ada
    if (existingUser) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 500 });
      }
    }

    // Buat user baru di Supabase Auth
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `${nik}@koperasi.local`,
      password,
      email_confirm: true,
      user_metadata: {
        nik,
        nama,
        role,
        db_user_id: userId,
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
