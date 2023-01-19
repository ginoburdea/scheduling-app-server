-- CreateTable
CREATE TABLE "calendars" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'Sample name',
    "businessDescription" TEXT NOT NULL DEFAULT 'Sample description',
    "dayStartsAt" TEXT NOT NULL DEFAULT '9:00',
    "dayEndsAt" TEXT NOT NULL DEFAULT '17:00',
    "breakBetweenBookings" INTEGER NOT NULL DEFAULT 5,
    "bookingDuration" INTEGER NOT NULL DEFAULT 25,
    "bookInAdvance" INTEGER NOT NULL DEFAULT 14,
    "workingDays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4]::INTEGER[],
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
